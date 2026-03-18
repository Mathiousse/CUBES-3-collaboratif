import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import CustomerDashboard from './components/CustomerDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import AdminDashboard from './components/AdminDashboard';
import PWAPrompt from './components/PWAPrompt';
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

  const renderDashboard = () => {
    if (!user) return <Auth onLoginSuccess={handleLoginSuccess} />;
    switch (user.role) {
      case 'CUSTOMER': return <CustomerDashboard onLogout={handleLogout} />;
      case 'DELIVERY_PERSON': return <DeliveryDashboard onLogout={handleLogout} />;
      case 'ADMIN': return <AdminDashboard onLogout={handleLogout} />;
      default: return <div>Unknown user role</div>;
    }
  };

  return (
    <>
      <PWAPrompt />
      {renderDashboard()}
    </>
  );
}

export default App;
