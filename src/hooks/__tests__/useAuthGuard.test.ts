import { renderHook } from '@testing-library/react';
import { useAuthGuard } from '../useAuthGuard';
import * as security from 'security';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('useAuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /auth when JWT is invalid', () => {
    jest.spyOn(security, 'validateJWT').mockReturnValue(false);
    renderHook(() => useAuthGuard());
    expect(mockNavigate).toHaveBeenCalledWith('/auth', { replace: true });
  });

  it('should not redirect when JWT is valid', () => {
    jest.spyOn(security, 'validateJWT').mockReturnValue(true);
    renderHook(() => useAuthGuard());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
