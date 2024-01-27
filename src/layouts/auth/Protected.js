import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { validateJWT, getAccessToken } from 'security.js';

const isAuthenticated = () => {
    return getAccessToken() && validateJWT();
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
