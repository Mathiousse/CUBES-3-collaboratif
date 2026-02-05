import React, { useState, useEffect } from 'react';
import { menuService, orderService } from '../services/api';
import CheckoutForm from './CheckoutForm';
import AddressAutocomplete from './AddressAutocomplete';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShoppingBag, Plus, Minus, LogOut, Utensils, MapPin, CreditCard } from 'lucide-react';
import '../styles/CustomerDashboard.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

function CustomerDashboard({ onLogout }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [view, setView] = useState('menu');
  const [orderFilter, setOrderFilter] = useState('active'); // 'active' or 'past'
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);

  useEffect(() => {
    fetchMenuItems();
    fetchMyOrders();

    // Poll for order updates every 10 seconds
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuService.getMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      setMyOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Helper to map product names to images (public folder paths)
  const getImageUrl = (name) => {
    const slug = name.toLowerCase();
    if (slug.includes('classic') || slug.includes('beef')) return '/images/classic-burger.png';
    if (slug.includes('vegan') || slug.includes('plant')) return '/images/veggie-burger.jpg';
    if (slug.includes('fries') || slug.includes('frites')) return '/images/fries.jpg';
    return 'https://placehold.co/400x300?text=Good+Food'; // Fallback
  };

  const addToCart = (item) => {
    const existing = cart.find((cartItem) => cartItem.id === item.id);
    if (existing) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find((cartItem) => cartItem.id === itemId);
    if (existing.quantity === 1) {
      setCart(cart.filter((cartItem) => cartItem.id !== itemId));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Votre panier est vide !');
      return;
    }
    if (!deliveryAddress.trim()) {
      alert('Veuillez entrer une adresse de livraison !');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: parseFloat(getCartTotal()),
        deliveryAddress: deliveryAddress,
        deliveryAddressDetails: addressDetails,
      };

      const response = await orderService.createOrder(orderData);
      setCheckoutData({
        clientSecret: response.data.clientSecret,
        orderId: response.data.order._id,
      });
      setView('payment');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Échec de la création de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCart([]);
    setDeliveryAddress('');
    setCheckoutData(null);
    setView('orders');
    fetchMyOrders();
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#ffa500',
      AWAITING_PICKUP: '#3498db',
      IN_TRANSIT: '#9b59b6',
      DELIVERED: '#27ae60',
      CANCELLED: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍔 Good Food</h1>
          <div className="header-actions">
            <button
              onClick={() => setView('menu')}
              className={view === 'menu' ? 'active' : ''}
            >
              <Utensils size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Menu
            </button>
            <button
              onClick={() => setView('orders')}
              className={view === 'orders' ? 'active' : ''}
            >
              <ShoppingBag size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Mes Commandes
            </button>
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {view === 'menu' && (
          <div className="menu-view">
            <div className="menu-section">
              <h2>Notre Menu</h2>
              <div className="menu-grid">
                {menuItems.map((item) => (
                  <div key={item.id} className="menu-item">
                    <div className="menu-item-image">
                      <img src={getImageUrl(item.name)} alt={item.name} />
                    </div>
                    <div className="menu-item-content">
                      <h3>{item.name}</h3>
                      <p className="description">{item.description}</p>
                      <div className="item-footer">
                        <span className="price">{item.price.toFixed(2)}€</span>
                        <button onClick={() => addToCart(item)} className="add-btn">
                          <Plus size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-section">
              <h2>
                <ShoppingBag size={24} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#0f172a' }} />
                Mon Panier
              </h2>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <p>Votre panier est vide</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <p>{item.price.toFixed(2)}€</p>
                        </div>
                        <div className="cart-item-actions">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="quantity-btn"
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="quantity-btn"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total">
                    <h3>Total</h3>
                    <span>{getCartTotal()}€</span>
                  </div>

                  <div className="delivery-address">
                    <label>
                      <MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                      Adresse de livraison
                    </label>
                    <AddressAutocomplete
                      value={deliveryAddress}
                      onChange={setDeliveryAddress}
                      onAddressSelect={setAddressDetails}
                    />
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="checkout-btn"
                    disabled={loading}
                  >
                    <CreditCard size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    {loading ? 'Traitement...' : 'Procéder au paiement'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'payment' && checkoutData && (
          <div className="payment-view">
            <h2>Finaliser votre paiement</h2>
            <div className="payment-info">
              <p>Total de la commande: {getCartTotal()}€</p>
              <p>Adresse de livraison: {deliveryAddress}</p>
            </div>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                clientSecret={checkoutData.clientSecret}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setView('menu')}
              />
            </Elements>
          </div>
        )}

        {view === 'orders' && (
          <div className="orders-view">
            <div className="orders-header">
              <h2>Mes Commandes</h2>
              <div className="order-filters">
                <button
                  className={orderFilter === 'active' ? 'active' : ''}
                  onClick={() => setOrderFilter('active')}
                >
                  En cours
                </button>
                <button
                  className={orderFilter === 'past' ? 'active' : ''}
                  onClick={() => setOrderFilter('past')}
                >
                  Historique
                </button>
              </div>
            </div>
            {(() => {
              const filteredOrders = myOrders.filter(order =>
                orderFilter === 'active'
                  ? order.status !== 'DELIVERED'
                  : order.status === 'DELIVERED'
              );

              return filteredOrders.length === 0 ? (
                <p className="no-orders">
                  {orderFilter === 'active'
                    ? 'Aucune commande en cours.'
                    : 'Aucune commande passée.'}
                </p>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <h3>Commande #{order._id.slice(-6)}</h3>
                        <span
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items.map((item, idx) => (
                          <p key={idx}>
                            {item.name} × {item.quantity} - {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        ))}
                      </div>
                      <div className="order-footer">
                        <p className="delivery-address-display">📍 {order.deliveryAddress}</p>
                        <p className="order-total">Total: {order.totalAmount.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;

