import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapWrapper from './MapWrapper';
import '../styles/DeliveryMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const restaurantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzRDQUY1MCIvPjx0ZXh0IHg9IjE2IiB5PSIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiPvCfjY0gPC90ZXh0Pjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2ZmNTczMyIvPjx0ZXh0IHg9IjE2IiB5PSIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiPvCfj6E8L3RleHQ+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function DeliveryMap({ order, restaurantLocation = { lat: 49.3824817969885, lon: 1.075217354037868 } }) {
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deliveryLocation = order?.deliveryAddressDetails?.coordinates;

  useEffect(() => {
    const fetchRoute = async () => {
      if (!deliveryLocation) {
        return;
      }

      // Reset state for new order
      setRoute(null);
      setDistance(null);
      setDuration(null);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${restaurantLocation.lon},${restaurantLocation.lat};${deliveryLocation.lon},${deliveryLocation.lat}?overview=full&geometries=geojson`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch route');
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeCoords = data.routes[0].geometry.coordinates.map(
            coord => [coord[1], coord[0]]
          );
          setRoute(routeCoords);
          setDistance((data.routes[0].distance / 1000).toFixed(2));
          setDuration(Math.round(data.routes[0].duration / 60));
        }
      } catch (err) {
        console.error('Error fetching route:', err);
        setError('Impossible de calculer l\'itinéraire');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [order._id]); // Only fetch when order changes!

  if (!deliveryLocation) {
    return (
      <div className="delivery-map-placeholder">
        <p>📍 Aucune coordonnée disponible pour cette commande</p>
        <p className="sub-text">L'adresse doit être sélectionnée via l'autocomplétion</p>
      </div>
    );
  }

  const center = [
    (restaurantLocation.lat + deliveryLocation.lat) / 2,
    (restaurantLocation.lon + deliveryLocation.lon) / 2
  ];

  const allCoordinates = [
    [restaurantLocation.lat, restaurantLocation.lon],
    [deliveryLocation.lat, deliveryLocation.lon]
  ];

  const markers = [
    {
      position: [restaurantLocation.lat, restaurantLocation.lon],
      icon: restaurantIcon,
      title: '🍔 Restaurant Good Food',
      description: 'Point de départ'
    },
    {
      position: [deliveryLocation.lat, deliveryLocation.lon],
      icon: deliveryIcon,
      title: '📍 Adresse de livraison',
      description: order.deliveryAddress
    }
  ];

  return (
    <div className="delivery-map-container">
      <div className="map-info">
        <div className="map-info-item">
          <span className="info-icon">📍</span>
          <span className="info-label">Destination:</span>
          <span className="info-value">{order.deliveryAddress}</span>
        </div>
        {distance && (
          <div className="map-info-item">
            <span className="info-icon">🛣️</span>
            <span className="info-label">Distance:</span>
            <span className="info-value">{distance} km</span>
          </div>
        )}
        {duration && (
          <div className="map-info-item">
            <span className="info-icon">⏱️</span>
            <span className="info-label">Temps estimé:</span>
            <span className="info-value">{duration} min</span>
          </div>
        )}
        {loading && (
          <div className="map-info-item loading">
            <span>Calcul de l'itinéraire...</span>
          </div>
        )}
        {error && (
          <div className="map-info-item error">
            <span>{error}</span>
          </div>
        )}
      </div>

      <MapWrapper
        orderId={order._id}
        center={center}
        markers={markers}
        route={route}
        allCoordinates={allCoordinates}
      />
    </div>
  );
}

export default DeliveryMap;

