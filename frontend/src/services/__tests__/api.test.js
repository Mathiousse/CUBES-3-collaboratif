const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    }
  }
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockApiClient)
}));

const { authService, menuService, orderService } = require('../api');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Auth Service', () => {
    test('register makes POST request to /auth/register', async () => {
      const userData = { email: 'test@example.com', password: 'pass123', role: 'CUSTOMER' };
      const mockResponse = { data: {} };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await authService.register(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', userData);
    });

    test('login makes POST request to /auth/login', async () => {
      const credentials = { email: 'test@example.com', password: 'pass123' };
      const mockResponse = { data: { token: 'test-token', userId: 'user123', role: 'CUSTOMER' } };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
    });
  });

  describe('Menu Service', () => {
    test('getMenuItems makes GET request to /logistique/menu-items', async () => {
      const mockMenuItems = [{ id: 1, name: 'Burger', price: 10.99 }];
      mockApiClient.get.mockResolvedValue({ data: mockMenuItems });

      await menuService.getMenuItems();

      expect(mockApiClient.get).toHaveBeenCalledWith('/logistique/menu-items');
    });
  });

  describe('Order Service', () => {
    test('createOrder makes POST request to /commande/orders', async () => {
      const orderData = { items: [], totalAmount: 10.99, deliveryAddress: '123 Main St' };
      const mockResponse = { data: { order: {}, clientSecret: 'secret' } };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await orderService.createOrder(orderData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/commande/orders', orderData);
    });

    test('getMyOrders makes GET request to /commande/orders/my-orders', async () => {
      const mockOrders = [{ _id: 'order123' }];
      mockApiClient.get.mockResolvedValue({ data: mockOrders });

      await orderService.getMyOrders();

      expect(mockApiClient.get).toHaveBeenCalledWith('/commande/orders/my-orders');
    });

    test('getAvailableOrders makes GET request to /commande/orders/available', async () => {
      const mockOrders = [{ _id: 'order456' }];
      mockApiClient.get.mockResolvedValue({ data: mockOrders });

      await orderService.getAvailableOrders();

      expect(mockApiClient.get).toHaveBeenCalledWith('/commande/orders/available');
    });

    test('claimOrder makes POST request to /commande/orders/:id/claim', async () => {
      const orderId = 'order123';
      const mockResponse = { data: {} };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await orderService.claimOrder(orderId);

      expect(mockApiClient.post).toHaveBeenCalledWith('/commande/orders/order123/claim');
    });

    test('updateOrderStatus makes PATCH request to /commande/orders/:id/status', async () => {
      const orderId = 'order123';
      const status = 'IN_TRANSIT';
      const mockResponse = { data: {} };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      await orderService.updateOrderStatus(orderId, status);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/commande/orders/order123/status', { status });
    });
  });
});

