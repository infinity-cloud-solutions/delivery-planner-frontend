import { jwt } from 'jsonwebtoken';
import jwt_decode from 'jsonwebtoken/decode';
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

export const logout = () => {
    const poolData = {
        UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    };

    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
        cognitoUser.signOut();
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
};

export function getAccessToken() {
    return localStorage.getItem('idToken');

}

export function validateJWT() {
    const token = localStorage.getItem('idToken')
    try {
        const decodedToken = jwt_decode(token, { complete: true });

        // change for prod
        const expectedIssuer = process.env.REACT_APP_COGNITO_ISS;
        if (decodedToken.payload.iss !== expectedIssuer) {
            throw new Error('Token no concuerda con el token de la base de datos');
        }
        if (new Date(decodedToken.payload.exp * 1000) < new Date()) {
            throw new Error('Tu sesión ha expirado');
        }
        return true;
    } catch (error) {
        console.error('JWT validation error:', error.message);
        logout()
        return false;
    }
}

export const isDriver = () => {
    const token = getAccessToken()
    if (!token) {
        return false;
    }

    try {
        const decodedToken = jwt_decode(token, { complete: true });
        const groups = decodedToken.payload['cognito:groups'];
        const response = groups && groups.includes('Repartidor');
        return response;
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return false;
    }
};

export const isAdmin = () => {
    const token = getAccessToken()
    if (!token) {
        return false;
    }

    try {
        const decodedToken = jwt_decode(token, { complete: true });
        const groups = decodedToken.payload['cognito:groups'];
        const response = groups && groups.includes('Admin');
        return response;
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return false;
    }
};

export function getFullNameFromLocalStorage() {
    const token = getAccessToken()
    const decodedToken = jwt_decode(token, { complete: true });

    if (!decodedToken) {
        console.error('idToken not found in local storage');
        return null;
    }

    try {
        const givenName = decodedToken.payload.given_name || '';
        const familyName = decodedToken.payload.family_name || '';

        const fullName = `${givenName} ${familyName}`.trim();

        return fullName;
    } catch (error) {
        console.error('Error parsing idToken payload:', error.message);
        return null;
    }
};

export function getEmailFromToken() {
    const token = getAccessToken()
    const decodedToken = jwt_decode(token, { complete: true });

    if (!decodedToken) {
        console.error('idToken not found in local storage');
        return null;
    }

    try {
        const userEmail = decodedToken.payload.email || '';

        return userEmail;
    } catch (error) {
        console.error('Error parsing idToken payload:', error.message);
        return null;
    }
};