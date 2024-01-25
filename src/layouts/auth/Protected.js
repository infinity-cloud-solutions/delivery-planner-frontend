import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { validateJWT } from 'security.js';

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
