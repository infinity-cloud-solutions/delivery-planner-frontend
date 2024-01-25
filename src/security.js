// jwtUtils.js

import jwt from 'jsonwebtoken';

export function validateJWT(token) {
    try {
        const decodedToken = jwt.decode(token, { complete: true });
        console.log(decodedToken);

        // change for prod
        const expectedIssuer = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_lw1SPkTV6";
        if (decodedToken.payload.iss !== expectedIssuer) {
            console.log(decodedToken.payload.iss, expectedIssuer);
            throw new Error('Invalid issuer');
        }
        console.log(decodedToken.payload.exp);
        if (new Date(decodedToken.payload.exp * 1000) < new Date()) {
            throw new Error('Token has expired');
        }

        return true;
    } catch (error) {
        console.error('JWT validation error:', error.message);
        return false;
    }
}

export const isDriver = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        return false;
    }

    try {
        const decodedToken = jwt.decode(token, { complete: true });
        const groups = decodedToken.payload['cognito:groups'];
        const response = groups && groups.includes('Repartidor');
        console.log("is Driver ", response);
        return response;
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return false;
    }
};
