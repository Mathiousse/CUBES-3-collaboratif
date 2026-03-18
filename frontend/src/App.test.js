import { render, screen } from '@testing-library/react';
import App from './App';

test('renders auth screen when no user is logged in', () => {
  render(<App />);
  expect(screen.getByText('🍔 Good Food')).toBeInTheDocument();
});
