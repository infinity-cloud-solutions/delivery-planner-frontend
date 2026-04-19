import React from 'react';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';

import Dashboard from '../dashboard';
import { createDeferred, renderWithProviders } from 'test/testUtils';
import { getAccessToken, isDriver, validateJWT } from 'security.js';
import { getDateAsQueryParam } from 'utils/Utility';

jest.mock('axios', () => ({
	get: jest.fn(),
	post: jest.fn(),
	put: jest.fn(),
	delete: jest.fn()
}));

const axios = require('axios');

jest.mock('components/calendar/MiniCalendar', () => () => <div data-testid='mini-calendar' />);
jest.mock('components/card/MiniStatistics', () => ({ name, value }) => (
	<div data-testid='mini-stat'>{`${name}:${value}`}</div>
));
jest.mock('components/icons/IconBox', () => ({ children }) => <div data-testid='icon-box'>{children}</div>);

let lastOrdersDashboardProps;

jest.mock('views/admin/dashboard/components/OrdersDashboard', () => (props) => {
	lastOrdersDashboardProps = props;
	return <div data-testid='orders-dashboard'>{JSON.stringify(props.tableData)}</div>;
});

jest.mock('views/admin/dashboard/variables/columnsData', () => ({
	columnsOrdersDashboard: [ { Header: 'Estado', accessor: 'status' } ]
}));

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	isDriver: jest.fn(),
	validateJWT: jest.fn()
}));

jest.mock('utils/Utility', () => ({
	...jest.requireActual('utils/Utility'),
	getDateAsQueryParam: jest.fn()
}));

describe('Dashboard admin view', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		lastOrdersDashboardProps = undefined;
		process.env.REACT_APP_ORDERS_BASE_URL = 'https://api.example.com/orders';
		getAccessToken.mockReturnValue('jwt-token');
		isDriver.mockReturnValue(false);
		validateJWT.mockReturnValue(true);
		getDateAsQueryParam.mockReturnValue('2026-04-18');
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('redirects to auth when the jwt is invalid', async () => {
		validateJWT.mockReturnValue(false);

		const { history } = renderWithProviders(<Dashboard />, { route: '/admin/dashboard' });

		await waitFor(() => {
			expect(history.location.pathname).toBe('/auth');
		});
		expect(axios.get).not.toHaveBeenCalled();
	});

	test('renders the restricted state for drivers', async () => {
		isDriver.mockReturnValue(true);
		axios.get.mockResolvedValue({ data: [] });

		renderWithProviders(<Dashboard />, { route: '/admin/dashboard' });

		expect(await screen.findByText('El contenido está restringido para administradores y mesa de control.')).toBeInTheDocument();
		expect(screen.getByText('Volver a la sección de repartidor')).toBeInTheDocument();
	});

	test('fetches, transforms, and sorts dashboard orders for admins', async () => {
		const deferredRequest = createDeferred();
		axios.get.mockReturnValue(deferredRequest.promise);

		renderWithProviders(<Dashboard />, { route: '/admin/dashboard' });

		expect(screen.queryByTestId('orders-dashboard')).not.toBeInTheDocument();

		deferredRequest.resolve({
			data: [
				{
					id: 2,
					client_name: 'Maria Fernanda Lopez',
					payment_method: 'cash',
					status: 'Programada'
				},
				{
					id: 1,
					client_name: 'Juan Perez',
					payment_method: 'PAID',
					status: 'Error'
				}
			]
		});

		await waitFor(() => {
			expect(screen.getByTestId('orders-dashboard')).toBeInTheDocument();
		});

		expect(axios.get).toHaveBeenCalledWith('https://api.example.com/orders', expect.objectContaining({
			headers: expect.objectContaining({
				Authorization: 'Bearer jwt-token'
			}),
			params: { date: '2026-04-18' }
		}));
		expect(lastOrdersDashboardProps.tableData).toEqual([
			expect.objectContaining({
				id: 1,
				name_display: 'Juan P',
				payment_method: 'Pagada',
				status: 'Error'
			}),
			expect.objectContaining({
				id: 2,
				name_display: 'Maria FL',
				payment_method: 'cash',
				status: 'Programada'
			})
		]);
	});

	test('renders an empty orders table when the api returns no dashboard data', async () => {
		axios.get.mockResolvedValue({ data: [] });

		renderWithProviders(<Dashboard />, { route: '/admin/dashboard' });

		await waitFor(() => {
			expect(screen.getByTestId('orders-dashboard')).toBeInTheDocument();
		});

		expect(lastOrdersDashboardProps.tableData).toEqual([]);
	});

	test('logs request failures and still renders the dashboard shell', async () => {
		axios.get.mockRejectedValue(new Error('dashboard failed'));

		renderWithProviders(<Dashboard />, { route: '/admin/dashboard' });

		await waitFor(() => {
			expect(screen.getByTestId('orders-dashboard')).toBeInTheDocument();
		});

		expect(console.error).toHaveBeenCalledWith('API error:', expect.any(Error));
		expect(lastOrdersDashboardProps.tableData).toEqual([]);
	});
});