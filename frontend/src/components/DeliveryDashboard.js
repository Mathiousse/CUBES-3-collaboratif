import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import DeliveryMap from './DeliveryMap';
import { Package, MapPin, CheckCircle, Truck, Navigation, LogOut, RefreshCw } from 'lucide-react';
import '../styles/DeliveryDashboard.css';

function DeliveryDashboard({ onLogout }) {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [view, setView] = useState('available');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const [available, my] = await Promise.all([
        orderService.getAvailableOrders(),
        orderService.getMyOrders(),
      ]);
      setAvailableOrders(available.data);

      // Separate active and completed orders
      const active = my.data.filter(order => order.status !== 'DELIVERED');
      const completed = my.data.filter(order => order.status === 'DELIVERED');

      setMyOrders(active);
      setCompletedOrders(completed);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleClaimOrder = async (orderId) => {
    setLoading(true);
    try {
      await orderService.claimOrder(orderId);
      await fetchOrders();
      setView('my-orders');
    } catch (error) {
      console.error('Error claiming order:', error);
      alert('Échec de la récupération de la commande. Elle a peut-être été prise par un autre livreur.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Échec de la mise à jour du statut de la commande.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#ffa500',
      AWAITING_PICKUP: '#3498db',
      IN_TRANSIT: '#9b59b6',
      DELIVERED: '#16a34a', // Updated to match our green
      CANCELLED: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      AWAITING_PICKUP: 'IN_TRANSIT',
      IN_TRANSIT: 'DELIVERED',
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      AWAITING_PICKUP: 'Démarrer la livraison',
      IN_TRANSIT: 'Marquer comme livrée',
    };
    return labels[currentStatus];
  };

  return (
    <div className="delivery-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚗 Good Food Livraison</h1>
          <div className="header-actions">
            <button
              onClick={() => setView('available')}
              className={view === 'available' ? 'active' : ''}
            >
              <Package size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Disponibles ({availableOrders.length})
            </button>
            <button
              onClick={() => setView('my-orders')}
              className={view === 'my-orders' ? 'active' : ''}
            >
              <Truck size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              En cours ({myOrders.length})
            </button>
            <button
              onClick={() => setView('completed')}
              className={view === 'completed' ? 'active' : ''}
            >
              <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Terminées ({completedOrders.length})
            </button>
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {view === 'available' && (
          <div className="orders-view">
            <h2>Commandes disponibles</h2>
            {availableOrders.length === 0 ? (
              <div className="no-orders">
                <Package size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <p>Aucune commande disponible</p>
                <p className="sub-text">Revenez bientôt pour de nouvelles livraisons</p>
              </div>
            ) : (
              <div className="orders-grid">
                {availableOrders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <span
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="order-body">
                      <div className="order-items">
                        <h4>Articles:</h4>
                        {order.items.map((item, idx) => (
                          <p key={idx}>
                            {item.name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                      <div className="order-details">
                        <p className="delivery-address">
                          <MapPin size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          <strong>Livrer à:</strong>
                          <br />
                          {order.deliveryAddress}
                        </p>
                        <p className="order-total">
                          <strong>Total:</strong> {order.totalAmount.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaimOrder(order._id)}
                      className="claim-btn"
                      disabled={loading}
                    >
                      {loading ? 'Traitement...' : 'Prendre la commande'}
                    </button>
                    {order.deliveryAddressDetails?.coordinates && (
                      <div className="mini-map-container">
                        <DeliveryMap key={`preview-map-${order._id}`} order={order} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'my-orders' && (
          <div className="orders-view">
            <h2>Livraisons en cours</h2>
            {myOrders.length === 0 ? (
              <div className="no-orders">
                <Truck size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <p>Aucune livraison en cours</p>
                <p className="sub-text">Prenez des commandes depuis l'onglet Disponibles</p>
              </div>
            ) : (
              <div className="orders-grid">
                {myOrders.map((order) => (
                  <div key={order._id} className="order-card active-delivery">
                    <div className="order-header">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <span
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="order-body">
                      <div className="order-items">
                        {/* ... (items mapping same as above) ... */}
                        <h4>Articles:</h4>
                        {order.items.map((item, idx) => (
                          <p key={idx}>{item.name} × {item.quantity}</p>
                        ))}
                      </div>
                      <div className="order-details">
                        <p className="delivery-address">
                          <MapPin size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          <strong>Livrer à:</strong>
                          <br />
                          {order.deliveryAddress}
                        </p>
                        <p className="order-total">
                          <strong>Total:</strong> {order.totalAmount.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    {order.status !== 'DELIVERED' && getNextStatus(order.status) && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                        className="update-status-btn"
                        disabled={loading}
                      >
                        <Navigation size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                        {loading ? 'Mise à jour...' : getNextStatusLabel(order.status)}
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <div className="delivered-badge">✅ Livrée</div>
                    )}
                    {order.deliveryAddressDetails?.coordinates ? (
                      <DeliveryMap key={`map-${order._id}`} order={order} />
                    ) : (
                      <div className="no-map-message">
                        <p>Carte non disponible</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'completed' && (
          <div className="orders-view">
            <h2>Livraisons terminées</h2>
            {completedOrders.length === 0 ? (
              <div className="no-orders">
                <CheckCircle size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <p>Aucune livraison terminée</p>
              </div>
            ) : (
              <div className="orders-grid">
                {completedOrders.map((order) => (
                  <div key={order._id} className="order-card completed-delivery">
                    <div className="order-header">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <span className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="order-body">
                      {/* Simplified body for history */}
                      <div className="order-details">
                        <p className="delivery-address">📍 {order.deliveryAddress}</p>
                        <p className="order-total">Total: {order.totalAmount.toFixed(2)}€</p>
                      </div>
                    </div>
                    <div className="delivered-badge">✅ Livrée</div>
                    {order.deliveryAddressDetails?.coordinates && (
                      <DeliveryMap key={`completed-map-${order._id}`} order={order} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default DeliveryDashboard;

