import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeliveryDashboard from '../DeliveryDashboard';
import { orderService } from '../../services/api';

jest.mock('../../services/api');

describe('DeliveryDashboard Component', () => {
  const mockOnLogout = jest.fn();
  const mockAvailableOrders = [
    {
      _id: 'order123',
      items: [{ name: 'Burger', quantity: 2, price: 10.99 }],
      totalAmount: 21.98,
      deliveryAddress: '123 Main St',
      status: 'PENDING',
    },
  ];
  const mockMyOrders = [
    {
      _id: 'order456',
      items: [{ name: 'Fries', quantity: 1, price: 4.50 }],
      totalAmount: 4.50,
      deliveryAddress: '456 Oak Ave',
      status: 'AWAITING_PICKUP',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    orderService.getAvailableOrders.mockResolvedValue({ data: mockAvailableOrders });
    orderService.getMyOrders.mockResolvedValue({ data: mockMyOrders });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders delivery dashboard and fetches orders', async () => {
    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    expect(screen.getByText('🚗 Good Food Livraison')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(orderService.getAvailableOrders).toHaveBeenCalled();
      expect(orderService.getMyOrders).toHaveBeenCalled();
    });
  });

  test('displays available orders', async () => {
    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Order #/)).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('21.98€')).toBeInTheDocument();
      expect(screen.getByText('Prendre la commande')).toBeInTheDocument();
    });
  });

  test('claims an order', async () => {
    orderService.claimOrder.mockResolvedValue({ data: {} });
    orderService.getAvailableOrders
      .mockResolvedValueOnce({ data: mockAvailableOrders })
      .mockResolvedValueOnce({ data: [] });
    orderService.getMyOrders
      .mockResolvedValueOnce({ data: mockMyOrders })
      .mockResolvedValueOnce({ data: [...mockMyOrders, mockAvailableOrders[0]] });

    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('Prendre la commande')).toBeInTheDocument();
    });
    
    const claimButton = screen.getByText('Prendre la commande');
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(orderService.claimOrder).toHaveBeenCalledWith('order123');
      expect(orderService.getAvailableOrders).toHaveBeenCalledTimes(2);
    });
  });

  test('switches to my deliveries view', async () => {
    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Commandes disponibles/)).toBeInTheDocument();
    });
    
    const myDeliveriesButton = screen.getByText(/En cours/);
    fireEvent.click(myDeliveriesButton);
    
    await waitFor(() => {
      expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    });
  });

  test('updates order status', async () => {
    orderService.updateOrderStatus.mockResolvedValue({ data: {} });

    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    const myDeliveriesButton = screen.getByText(/En cours/);
    fireEvent.click(myDeliveriesButton);
    
    await waitFor(() => {
      expect(screen.getByText('Démarrer la livraison')).toBeInTheDocument();
    });
    
    const startButton = screen.getByText('Démarrer la livraison');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order456', 'IN_TRANSIT');
    });
  });

  test('displays empty state when no available orders', async () => {
    orderService.getAvailableOrders.mockResolvedValue({ data: [] });

    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Aucune commande disponible/)).toBeInTheDocument();
    });
  });

  test('calls logout when logout button is clicked', () => {
    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Déconnexion');
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('auto-refreshes orders every 10 seconds', async () => {
    render(<DeliveryDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(orderService.getAvailableOrders).toHaveBeenCalledTimes(1);
    });
    
    jest.advanceTimersByTime(10000);
    
    await waitFor(() => {
      expect(orderService.getAvailableOrders).toHaveBeenCalledTimes(2);
    });
  });
});

