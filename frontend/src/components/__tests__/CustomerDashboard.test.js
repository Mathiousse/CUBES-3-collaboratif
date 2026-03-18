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
      expect(screen.getByText('10.99€')).toBeInTheDocument();
      expect(screen.getByText('4.50€')).toBeInTheDocument();
    });
  });

  test('adds items to cart and opens cart modal', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByText('Ajouter');
    fireEvent.click(addButtons[0]);

    // Desktop and mobile cart buttons both show a badge
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);

    const cartButton = screen.getAllByRole('button', { name: /Ouvrir le panier/i })[0];
    fireEvent.click(cartButton);

    expect(screen.getByText('Mon Panier')).toBeInTheDocument();
    expect(screen.getAllByText('10.99€').length).toBeGreaterThan(0);
  });

  test('switches to orders view', async () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Notre menu -CI/CD')).toBeInTheDocument();
    });

    const ordersButton = screen.getByText('Mes Commandes');
    fireEvent.click(ordersButton);

    await waitFor(() => {
      expect(screen.getByText(/Commande #/)).toBeInTheDocument();
      expect(screen.getByText(/Main St/)).toBeInTheDocument();
    });
  });

  test('calls logout when logout button is clicked', () => {
    render(<CustomerDashboard onLogout={mockOnLogout} />);

    const logoutButton = screen.getByText('Déconnexion');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });
});

