// src/hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateJWT } from 'security';

/**
 * Redirects to /auth if the JWT is missing or invalid.
 * Call at the top of any protected view component.
 */
export function useAuthGuard(): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (!validateJWT()) {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);
}
