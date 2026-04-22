import jwt_decode from 'jsonwebtoken/decode';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

export const logout = (): void => {
  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID as string,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID as string,
  };

  const userPool = new CognitoUserPool(poolData);
  const cognitoUser: CognitoUser | null = userPool.getCurrentUser();

  if (cognitoUser) {
    cognitoUser.signOut();
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
};

export function getAccessToken(): string | null {
  return localStorage.getItem('idToken');
}

interface JwtPayload {
  iss: string;
  exp: number;
  'cognito:groups'?: string[];
  given_name?: string;
  family_name?: string;
  email?: string;
}

interface DecodedToken {
  payload: JwtPayload;
}

function decodeToken(): DecodedToken | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return jwt_decode(token, { complete: true }) as DecodedToken;
  } catch {
    return null;
  }
}

export function validateJWT(): boolean {
  try {
    const decoded = decodeToken();
    if (!decoded) throw new Error('Token inválido');

    const expectedIssuer = process.env.REACT_APP_COGNITO_ISS;
    if (decoded.payload.iss !== expectedIssuer) {
      throw new Error('Token no concuerda con el token de la base de datos');
    }
    if (new Date(decoded.payload.exp * 1000) < new Date()) {
      throw new Error('Tu sesión ha expirado');
    }
    return true;
  } catch (error) {
    console.error('JWT validation error:', (error as Error).message);
    logout();
    return false;
  }
}

export const isDriver = (): boolean => {
  const decoded = decodeToken();
  if (!decoded) return false;
  try {
    const groups = decoded.payload['cognito:groups'];
    return Boolean(groups && groups.includes('Repartidor'));
  } catch {
    return false;
  }
};

export const isAdmin = (): boolean => {
  const decoded = decodeToken();
  if (!decoded) return false;
  try {
    const groups = decoded.payload['cognito:groups'];
    return Boolean(groups && groups.includes('Admin'));
  } catch {
    return false;
  }
};

export function getFullNameFromLocalStorage(): string | null {
  const decoded = decodeToken();
  if (!decoded) return null;
  try {
    const givenName = decoded.payload.given_name ?? '';
    const familyName = decoded.payload.family_name ?? '';
    return `${givenName} ${familyName}`.trim();
  } catch {
    return null;
  }
}

export function getEmailFromToken(): string | null {
  const decoded = decodeToken();
  if (!decoded) return null;
  try {
    return decoded.payload.email ?? null;
  } catch {
    return null;
  }
}