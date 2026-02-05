import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import CustomerDashboard from './components/CustomerDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (token && role && userId) {
      setUser({ token, role, userId });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  if (user.role === 'CUSTOMER') {
    return <CustomerDashboard onLogout={handleLogout} />;
  }

  if (user.role === 'DELIVERY_PERSON') {
    return <DeliveryDashboard onLogout={handleLogout} />;
  }

  return <div>Unknown user role</div>;
}

export default App;
