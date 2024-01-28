import jwt from 'jsonwebtoken';

let jsonWebToken = ""

export function getAccessToken() {
    if (!jsonWebToken){
        jsonWebToken = localStorage.getItem('idToken');
        return jsonWebToken
    }
    return jsonWebToken
}

export function validateJWT() {
    const token = localStorage.getItem('accessToken')
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        return false;
    }
}

export const isDriver = () => {
    const token = getAccessToken()
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

export const isAdmin = () => {
    const token = getAccessToken()
    if (!token) {
        return false;
    }

    try {
        const decodedToken = jwt.decode(token, { complete: true });
        const groups = decodedToken.payload['cognito:groups'];
        const response = groups && groups.includes('Admin');
        console.log("is Admin ", response);
        return response;
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return false;
    }
};

export function getFullNameFromLocalStorage() {
    const token = getAccessToken()
    const decodedToken = jwt.decode(token, { complete: true });
    console.log(decodedToken);

    if (!decodedToken) {
        console.error('idToken not found in local storage');
        return null;
    }

    try {
        console.log(decodedToken.payload)
        console.log(decodedToken.payload.given_name, decodedToken.payload.family_name)
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
