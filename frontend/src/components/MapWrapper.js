import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const MapBoundsUpdater = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
};

function MapWrapper({ orderId, center, markers, route, allCoordinates }) {
  const [mapKey, setMapKey] = useState(Date.now());

  useEffect(() => {
    // Generate completely new key when orderId changes
    setMapKey(Date.now());
  }, [orderId]);

  const mapId = `map-container-${mapKey}`;

  return (
    <div key={mapKey} id={mapId} style={{ position: 'relative', height: '400px', width: '100%' }}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        attributionControl={false}
      >
        {/* Option 1: CartoDB Light (Clean, minimal, gray tones) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Option 2: CartoDB Dark (Dark theme - uncomment to use)
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      */}

        {/* Option 3: Stamen Toner (Black & white, high contrast - uncomment to use)
      <TileLayer
        attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png"
      />
      */}

        {/* Option 4: CartoDB Voyager (Muted colors - uncomment to use)
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      */}

        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position} icon={marker.icon}>
            <Popup>
              <strong>{marker.title}</strong>
              <br />
              {marker.description}
            </Popup>
          </Marker>
        ))}

        {route && (
          <Polyline
            positions={route}
            color="#4CAF50"
            weight={4}
            opacity={0.7}
          />
        )}

        <MapBoundsUpdater coordinates={allCoordinates} />
      </MapContainer>
    </div>
  );
}

export default MapWrapper;

