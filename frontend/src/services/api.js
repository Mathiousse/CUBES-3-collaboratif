import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const menuService = {
  getMenuItems: () => api.get('/logistique/menu-items'),
};

export const orderService = {
  createOrder: (orderData) => api.post('/commande/orders', orderData),
  getMyOrders: () => api.get('/commande/orders/my-orders'),
  getAvailableOrders: () => api.get('/commande/orders/available'),
  claimOrder: (orderId) => api.post(`/commande/orders/${orderId}/claim`),
  updateOrderStatus: (orderId, status) => api.patch(`/commande/orders/${orderId}/status`, { status }),
};

export default api;

