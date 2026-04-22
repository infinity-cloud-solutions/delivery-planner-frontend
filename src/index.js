import React from 'react';
import { createRoot } from 'react-dom/client';
import 'assets/css/App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from 'layouts/auth';
import AdminLayout from 'layouts/admin';
import DriverLayout from 'layouts/driver';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import ProtectedRoute from 'layouts/auth/Protected';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HashRouter>
        <Switch>
          <Route path="/auth" component={AuthLayout} />
          <ProtectedRoute path="/admin" component={AdminLayout} />
          <ProtectedRoute path="/driver" component={DriverLayout} />
          <Redirect from="/" to="/auth" />
        </Switch>
      </HashRouter>
    </ChakraProvider>
  </React.StrictMode>
);
