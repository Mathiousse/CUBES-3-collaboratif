import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '../Auth';
import { authService } from '../../services/api';

jest.mock('../../services/api');

describe('Auth Component', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form by default', () => {
    render(<Auth onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('🍔 Good Food')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  test('switches to register form when register tab is clicked', () => {
    render(<Auth onLoginSuccess={mockOnLoginSuccess} />);
    
    const registerTab = screen.getByText('Inscription');
    fireEvent.click(registerTab);
    
    expect(screen.getByPlaceholderText('Votre nom')).toBeInTheDocument();
    expect(screen.getByText('Je suis...')).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockResponse = {
      data: {
        token: 'test-token',
        userId: 'user123',
        role: 'CUSTOMER'
      }
    };
    authService.login.mockResolvedValue(mockResponse);

    render(<Auth onLoginSuccess={mockOnLoginSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' }
    });
    
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  test('handles registration', async () => {
    authService.register.mockResolvedValue({ data: {} });

    render(<Auth onLoginSuccess={mockOnLoginSuccess} />);
    
    const registerTab = screen.getByText('Inscription');
    fireEvent.click(registerTab);
    
    fireEvent.change(screen.getByPlaceholderText('Votre nom'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' }
    });
    
    const createButton = screen.getByRole('button', { name: 'Créer un compte' });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
      expect(screen.getByText(/Compte créé/)).toBeInTheDocument();
    });
  });

  test('displays error message on failed login', async () => {
    authService.login.mockRejectedValue({
      response: { data: 'Invalid credentials' }
    });

    render(<Auth onLoginSuccess={mockOnLoginSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' }
    });
    
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

