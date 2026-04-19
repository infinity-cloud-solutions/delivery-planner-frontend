import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

let mockAdminNavbarProps;
let mockDriverNavbarProps;
let mockSidebarProps = [];

jest.mock('components/navbar/NavbarAdmin.js', () => (props) => {
	mockAdminNavbarProps = props;
	return <div data-testid='admin-navbar'>{props.brandText}</div>;
});

jest.mock('components/navbar/NavbarDriver.js', () => (props) => {
	mockDriverNavbarProps = props;
	return <div data-testid='driver-navbar'>{props.brandText}</div>;
});

jest.mock('components/sidebar/Sidebar.js', () => (props) => {
	mockSidebarProps = [ ...mockSidebarProps, props ];
	return <div data-testid='layout-sidebar'>{props.routes.length}</div>;
});

jest.mock('components/footer/FooterAdmin.js', () => () => <div data-testid='layout-footer' />);

jest.mock('routes.js', () => {
	const React = require('react');

	return [
		{ name: 'Dashboard', layout: '/admin', path: '/dashboard', component: () => React.createElement('div', null, 'admin-dashboard'), secondary: true, messageNavbar: 'Admin message' },
		{ collapse: true, items: [ { name: 'Nested', layout: '/admin', path: '/nested', component: () => React.createElement('div', null, 'admin-nested') } ] },
		{ category: true, items: [ { name: 'Category Page', layout: '/admin', path: '/category', component: () => React.createElement('div', null, 'admin-category') } ] },
		{ name: 'Ignored', layout: '/outside', path: '/ignored', component: () => React.createElement('div', null, 'ignored-admin') }
	];
});

jest.mock('driverRoutes.js', () => {
	const React = require('react');

	return [
		{ name: 'Deliveries', layout: '/driver', path: '/deliveries', component: () => React.createElement('div', null, 'driver-deliveries'), secondary: false, messageNavbar: 'Driver message' },
		{ collapse: true, items: [ { name: 'Driver Nested', layout: '/driver', path: '/nested', component: () => React.createElement('div', null, 'driver-nested') } ] },
		{ category: true, items: [ { name: 'Driver Category', layout: '/driver', path: '/category', component: () => React.createElement('div', null, 'driver-category') } ] },
		{ name: 'Ignored', layout: '/outside', path: '/ignored', component: () => React.createElement('div', null, 'ignored-driver') }
	];
});

import AdminLayout from '../admin';
import DriverLayout from '../driver';
import theme from 'theme/theme';

const renderWithRoute = (ui, route) => {
	window.history.pushState({}, '', route);
	const history = createMemoryHistory({ initialEntries: [ route ] });

	return render(
		<ChakraProvider theme={theme}>
			<Router history={history}>{ui}</Router>
		</ChakraProvider>
	);
};

describe('Admin and driver layouts', () => {
	beforeEach(() => {
		mockAdminNavbarProps = undefined;
		mockDriverNavbarProps = undefined;
		mockSidebarProps = [];
	});

	test('renders admin layout routes, sidebar, navbar metadata, and footer', () => {
		let view = renderWithRoute(<AdminLayout />, '/admin/dashboard');

		expect(screen.getByTestId('admin-navbar')).toHaveTextContent('Dashboard');
		expect(mockAdminNavbarProps.secondary).toBe(true);
		expect(mockAdminNavbarProps.message).toBe('Admin message');
		expect(screen.getByText('admin-dashboard')).toBeInTheDocument();
		expect(screen.getByTestId('layout-sidebar')).toHaveTextContent('4');
		expect(screen.getByTestId('layout-footer')).toBeInTheDocument();
		view.unmount();

		view = renderWithRoute(<AdminLayout />, '/admin/nested');
		expect(screen.getByTestId('admin-navbar')).toHaveTextContent('Nested');
		expect(screen.getByText('admin-nested')).toBeInTheDocument();
		view.unmount();

		view = renderWithRoute(<AdminLayout />, '/admin/category');
		expect(screen.getByTestId('admin-navbar')).toHaveTextContent('Category Page');
		expect(screen.getByText('admin-category')).toBeInTheDocument();
		view.unmount();

		renderWithRoute(<AdminLayout />, '/admin/full-screen-maps');
		expect(screen.queryByText('admin-dashboard')).not.toBeInTheDocument();
	});

	test('renders driver layout routes, sidebar, navbar metadata, and footer', () => {
		let view = renderWithRoute(<DriverLayout />, '/driver/deliveries');

		expect(screen.getByTestId('driver-navbar')).toHaveTextContent('Deliveries');
		expect(mockDriverNavbarProps.secondary).toBe(false);
		expect(mockDriverNavbarProps.message).toBe('Driver message');
		expect(screen.getByText('driver-deliveries')).toBeInTheDocument();
		expect(screen.getByTestId('layout-sidebar')).toHaveTextContent('4');
		expect(screen.getByTestId('layout-footer')).toBeInTheDocument();
		view.unmount();

		view = renderWithRoute(<DriverLayout />, '/driver/nested');
		expect(screen.getByTestId('driver-navbar')).toHaveTextContent('Driver Nested');
		expect(screen.getByText('driver-nested')).toBeInTheDocument();
		view.unmount();

		view = renderWithRoute(<DriverLayout />, '/driver/category');
		expect(screen.getByTestId('driver-navbar')).toHaveTextContent('Driver Category');
		expect(screen.getByText('driver-category')).toBeInTheDocument();
		view.unmount();

		renderWithRoute(<DriverLayout />, '/driver/full-screen-maps');
		expect(screen.queryByText('driver-deliveries')).not.toBeInTheDocument();
	});
});