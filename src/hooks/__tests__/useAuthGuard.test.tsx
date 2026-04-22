import { render } from '@testing-library/react';
import { useAuthGuard } from '../useAuthGuard';
import * as security from 'security';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test component that uses the hook
function TestComponent() {
  useAuthGuard();
  return null;
}

describe('useAuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /auth when JWT is invalid', () => {
    jest.spyOn(security, 'validateJWT').mockReturnValue(false);
    render(<TestComponent />);
    expect(mockNavigate).toHaveBeenCalledWith('/auth', { replace: true });
  });

  it('should not redirect when JWT is valid', () => {
    jest.spyOn(security, 'validateJWT').mockReturnValue(true);
    render(<TestComponent />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
