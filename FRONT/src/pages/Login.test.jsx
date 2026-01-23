import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

jest.mock('../api/endpoints', () => ({
  authAPI: {
    login: jest.fn(async (u, p) => ({ data: { token: 't', user: { username: u } } }))
  }
}));

function renderLogin(props = {}) {
  return render(
    <MemoryRouter>
      <Login {...props} />
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows error when username or password missing', async () => {
    renderLogin({ onLoginSuccess: jest.fn() });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/username and password are required/i)).toBeInTheDocument();
  });

  it('logs in successfully and navigates', async () => {
    const onLoginSuccess = jest.fn();
    renderLogin({ onLoginSuccess });

    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith({ username: 'user' }));

    expect(localStorage.getItem('token')).toBe('t');
    expect(localStorage.getItem('user')).toContain('user');
  });
});
