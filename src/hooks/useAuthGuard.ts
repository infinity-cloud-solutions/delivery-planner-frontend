// src/hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateJWT } from 'security';

/**
 * Guards a protected route by validating the JWT on mount.
 * If the token is missing or invalid, calls logout() (clears session storage
 * and signs out of Cognito) and navigates to /auth with replace:true.
 *
 * Must be called inside a component rendered within a <Router> context.
 */
export function useAuthGuard(): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (!validateJWT()) {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);
}
