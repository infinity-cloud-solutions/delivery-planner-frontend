import React from 'react';
import '@testing-library/jest-dom';

jest.mock('views/auth/signIn', () => function SignInMock() {
	return null;
});

jest.mock('views/driver/deliveries', () => function DeliveriesMock() {
	return null;
});

jest.mock('views/admin/dashboard', () => function DashboardMock() {
	return null;
});

jest.mock('views/admin/products', () => function ProductsMock() {
	return null;
});

jest.mock('views/admin/clients', () => function ClientsMock() {
	return null;
});

jest.mock('views/admin/orders', () => function OrdersMock() {
	return null;
});

import authRoutes from 'authRoutes';
import driverRoutes from 'driverRoutes';
import routes from 'routes';
import SignInMock from 'views/auth/signIn';
import DeliveriesMock from 'views/driver/deliveries';
import DashboardMock from 'views/admin/dashboard';
import ProductsMock from 'views/admin/products';
import ClientsMock from 'views/admin/clients';
import OrdersMock from 'views/admin/orders';

describe('Route configuration modules', () => {
	test('exports the auth sign-in route', () => {
		expect(authRoutes).toHaveLength(1);
		expect(authRoutes[0]).toMatchObject({
			name: 'Iniciar sesión',
			layout: '/auth',
			path: '/sign-in',
			component: SignInMock
		});
		expect(React.isValidElement(authRoutes[0].icon)).toBe(true);
	});

	test('exports the driver deliveries route', () => {
		expect(driverRoutes).toHaveLength(1);
		expect(driverRoutes[0]).toMatchObject({
			name: 'Repartos',
			layout: '/driver',
			path: '/deliveries',
			component: DeliveriesMock
		});
		expect(React.isValidElement(driverRoutes[0].icon)).toBe(true);
	});

	test('exports the admin dashboard, product, client, and order routes', () => {
		expect(routes).toHaveLength(4);
		expect(routes).toEqual([
			expect.objectContaining({
				name: 'Dashboard',
				layout: '/admin',
				path: '/dashboard',
				component: DashboardMock
			}),
			expect.objectContaining({
				name: 'Productos',
				layout: '/admin',
				path: '/products',
				component: ProductsMock,
				secondary: true
			}),
			expect.objectContaining({
				name: 'Clientes',
				layout: '/admin',
				path: '/clients',
				component: ClientsMock,
				secondary: true
			}),
			expect.objectContaining({
				name: 'Órdenes',
				layout: '/admin',
				path: '/orders',
				component: OrdersMock
			})
		]);
		routes.forEach((route) => {
			expect(React.isValidElement(route.icon)).toBe(true);
		});
	});
});