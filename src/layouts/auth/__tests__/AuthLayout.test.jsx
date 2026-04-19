import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('components/footer/FooterAuth', () => () => <div data-testid='auth-footer' />);
jest.mock('components/fixedPlugin/FixedPlugin', () => () => <div data-testid='fixed-plugin' />);

jest.mock('authRoutes.js', () => {
	const React = require('react');

	return [
		{ name: 'Login', layout: '/auth', path: '/login', component: () => React.createElement('div', null, 'auth-page') },
		{ collapse: true, items: [ { name: 'Nested', layout: '/auth', path: '/nested', component: () => React.createElement('div', null, 'nested-auth-page') } ] },
		{ category: true, items: [ { name: 'Category', layout: '/auth', path: '/category', component: () => React.createElement('div', null, 'category-auth-page') } ] },
		{ name: 'Ignored', layout: '/outside', path: '/ignored', component: () => React.createElement('div', null, 'ignored-auth-page') }
	];
});

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	validateJWT: jest.fn()
}));

import AuthIllustration from '../Default';
import AuthLayout from '..';
import ProtectedRoute from '../Protected';
import { getAccessToken, validateJWT } from 'security.js';
import theme from 'theme/theme';

const renderWithRouter = (ui, route) => {
	window.history.pushState({}, '', route);
	const history = createMemoryHistory({ initialEntries: [ route ] });

	return {
		history,
		...render(
			<ChakraProvider theme={theme}>
				<Router history={history}>{ui}</Router>
			</ChakraProvider>
		)
	};
};

describe('Auth layouts', () => {
	test('renders the auth illustration shell with footer and fixed plugin', () => {
		renderWithRouter(
			<AuthIllustration illustrationBackground='background.png'>
				<div>auth-child</div>
			</AuthIllustration>,
			'/auth/login'
		);

		expect(screen.getByText('auth-child')).toBeInTheDocument();
		expect(screen.getByTestId('auth-footer')).toBeInTheDocument();
		expect(screen.getByTestId('fixed-plugin')).toBeInTheDocument();
	});

	test('renders and protects auth routes, including nested collapse and category routes', async () => {
		getAccessToken.mockReturnValue('token');
		validateJWT.mockReturnValue(true);

		const { history } = renderWithRouter(<ProtectedRoute path='/admin' component={() => <div>protected-page</div>} />, '/admin');

		expect(screen.getByText('protected-page')).toBeInTheDocument();
		expect(history.location.pathname).toBe('/admin');

		let view = renderWithRouter(<AuthLayout />, '/auth/login');
		expect(screen.getByText('auth-page')).toBeInTheDocument();
		view.unmount();

		view = renderWithRouter(<AuthLayout />, '/auth/nested');
		expect(screen.getByText('nested-auth-page')).toBeInTheDocument();
		view.unmount();

		view = renderWithRouter(<AuthLayout />, '/auth/category');
		expect(screen.getByText('category-auth-page')).toBeInTheDocument();
		view.unmount();

		renderWithRouter(<AuthLayout />, '/auth/full-screen-maps');
		expect(screen.queryByText('auth-page')).not.toBeInTheDocument();
	});

	test('redirects protected routes to auth when the session is invalid', async () => {
		getAccessToken.mockReturnValue(null);
		validateJWT.mockReturnValue(false);

		const { history } = renderWithRouter(
			<ProtectedRoute path='/admin' component={() => <div>protected-page</div>} />,
			'/admin'
		);

		await waitFor(() => {
			expect(history.location.pathname).toBe('/auth');
		});
		expect(screen.queryByText('protected-page')).not.toBeInTheDocument();
	});
});