import jwt from 'jsonwebtoken';

export function validateJWT(token) {
    try {
        const decodedToken = jwt.decode(token, { complete: true });
        console.log(decodedToken);

        // change for prod
        const expectedIssuer = process.env.REACT_APP_COGNITO_ISS;
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

export function getFullNameFromLocalStorage() {
    const idToken = localStorage.getItem('idToken');
    const decodedToken = jwt.decode(idToken, { complete: true });
    console.log(decodedToken);

    if (!decodedToken) {
        console.error('idToken not found in local storage');
        return null;
    }

    try {
        console.log(decodedToken.payload)
        console.log(decodedToken.payload.given_name, decodedToken.family_name)
        const givenName = decodedToken.payload.given_name || '';
        const familyName = decodedToken.payload.family_name || '';

        const fullName = `${givenName} ${familyName}`.trim();
        console.log(fullName)

        return fullName;
    } catch (error) {
        console.error('Error parsing idToken payload:', error.message);
        return null;
    }
};
