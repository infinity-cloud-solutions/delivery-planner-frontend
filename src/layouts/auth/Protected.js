import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import jwt from 'jsonwebtoken';

function validateJWT(token) {
    try {
        const decodedToken = jwt.decode(token, { complete: true })
        console.log(decodedToken)

        // change for prod
        const expectedIssuer = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_lw1SPkTV6"
        if (decodedToken.payload.iss !== expectedIssuer) {
            console.log(decodedToken.payload.iss, expectedIssuer)
            throw new Error('Invalid issuer');
        }
        console.log(decodedToken.payload.exp)
        if (new Date(decodedToken.payload.exp * 1000) < new Date()) {
            throw new Error('Token has expired');
        }
        console.log(true)
        return true;
    } catch (error) {
        console.error('JWT validation error:', error.message);
        return false;
    }
}

const isAuthenticated = () => {
    const token = localStorage.getItem('accessToken');
    return token && validateJWT(token);
};

const ProtectedRoute = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                console.log(props)
                if (!isAuthenticated()) {
                    return <Redirect to="/auth" />;
                }

                return <Component {...props} />;
            }}
        />
    );
};

export default ProtectedRoute;
