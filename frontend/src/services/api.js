import axios from 'axios';
import { API_BASE_URL } from '../config/apiBaseUrl';

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

