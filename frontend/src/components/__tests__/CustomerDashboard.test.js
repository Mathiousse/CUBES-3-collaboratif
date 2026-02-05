import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomerDashboard from '../CustomerDashboard';
import { menuService, orderService } from '../../services/api';

jest.mock('../../services/api');
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  useStripe: () => null,
  useElements: () => null,
  CardElement: () => <div>Card Element</div>,
}));
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(null)),
}));

describe('CustomerDashboard Component', () => {
  const mockOnLogout = jest.fn();
  const mockMenuItems = [
    { id: 1, name: 'Burger', description: 'Tasty burger', price: 10.99 },
    { id: 2, name: 'Fries', description: 'Crispy fries', price: 4.50 },
  ];
  const mockOrders = [
    {
      _id: 'order123',
      items: [{ name: 'Burger', quantity: 1, price: 10.99 }],
      totalAmount: 10.99,
      deliveryAddress: '123 Main St',
      status: 'PENDING',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    menuService.getMenuItems.mockResolvedValue({ data: mockMenuItems });
    orderService.getMyOrders.mockResolvedValue({ data: mockOrders });
  });

  test('renders customer dashboard and fetches data', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);
    
    expect(screen.getByText('🍔 Good Food')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(menuService.getMenuItems).toHaveBeenCalled();
      expect(orderService.getMyOrders).toHaveBeenCalled();
    });
  });

  test('displays menu items', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Fries')).toBeInTheDocument();
      expect(screen.getByText('$10.99')).toBeInTheDocument();
      expect(screen.getByText('$4.50')).toBeInTheDocument();
    });
  });

  test('adds items to cart', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });
    
    const addButtons = screen.getAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);
    
    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    expect(screen.getByText(/Total: \$10.99/)).toBeInTheDocument();
  });

  test('increases and decreases cart quantity', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });
    
    const addButtons = screen.getAllByText('Add to Cart');
    fireEvent.click(addButtons[0]);
    
    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);
    
    expect(screen.getByText(/Total: \$21.98/)).toBeInTheDocument();
    
    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);
    
    expect(screen.getByText(/Total: \$10.99/)).toBeInTheDocument();
  });

  test('switches to orders view', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);
    
    await waitFor(() => {
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
    
    const ordersButton = screen.getByText('My Orders');
    fireEvent.click(ordersButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Order #/)).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });
  });

  test('calls logout when logout button is clicked', () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalled();
  });
});

