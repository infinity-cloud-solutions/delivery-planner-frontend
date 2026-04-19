import React from 'react';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';

import OrdersView from '../orders';
import { renderWithProviders } from 'test/testUtils';
import { getAccessToken, isDriver, validateJWT } from 'security.js';
import { DeliveryProcessor } from '../orders/components/DeliveryProcessor';
import { getDateAsQueryParam } from 'utils/Utility';

jest.mock('axios', () => ({
	get: jest.fn(),
	post: jest.fn(),
	put: jest.fn(),
	delete: jest.fn()
}));

jest.mock('framer-motion', () => {
	const React = require('react');
	const createMotionElement = (tagName) => {
		return React.forwardRef(({ children, ...props }, ref) => {
			return React.createElement(tagName, { ...props, ref }, children);
		});
	};
	const motion = new Proxy((Component) => Component, {
		get(target, prop) {
			if (prop in target) {
				return target[prop];
			}

			return createMotionElement(prop);
		}
	});

	motion.custom = motion;

	return {
		__esModule: true,
		AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
		isValidMotionProp: () => true,
		motion
	};
});

const axios = require('axios');

let lastOrdersProps;

jest.mock('views/admin/orders/components/Orders', () => (props) => {
	lastOrdersProps = props;
	return <div data-testid='orders-view'>{JSON.stringify(props.tableData)}</div>;
});

jest.mock('../orders/components/DeliveryProcessor', () => ({
	DeliveryProcessor: jest.fn()
}));

jest.mock('views/admin/orders/variables/columnsData', () => ({
	columnsDataOrders: [ { Header: 'Estado', accessor: 'status' } ]
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

describe('Orders admin view', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		lastOrdersProps = undefined;
		process.env.REACT_APP_ORDERS_BASE_URL = 'https://api.example.com/orders';
		process.env.REACT_APP_PRODUCTS_BASE_URL = 'https://api.example.com/products';
		process.env.REACT_APP_CLIENTS_BASE_URL = 'https://api.example.com/clients';
		process.env.REACT_APP_UPDATE_SEQUENCING_ORDERS_BASE_URL = 'https://api.example.com/routes';
		getAccessToken.mockReturnValue('jwt-token');
		isDriver.mockReturnValue(false);
		validateJWT.mockReturnValue(true);
		getDateAsQueryParam.mockReturnValue('2026-04-18');
		DeliveryProcessor.mockImplementation((selectedDrivers, orders) => orders);
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const mockGetByUrl = ({ orders = [], products = [], clients = null }) => {
		axios.get.mockImplementation((url) => {
			if (url === 'https://api.example.com/orders') {
				return Promise.resolve({ data: orders });
			}

			if (url === 'https://api.example.com/products') {
				return Promise.resolve({ data: products });
			}

			if (url === 'https://api.example.com/clients') {
				return Promise.resolve({ data: clients });
			}

			return Promise.reject(new Error(`Unexpected GET for ${url}`));
		});
	};

	test('renders the restricted state for drivers', async () => {
		isDriver.mockReturnValue(true);
		mockGetByUrl({ orders: [], products: [] });

		renderWithProviders(<OrdersView />, { route: '/admin/orders' });

		expect(await screen.findByText('El contenido está restringido para administradores y mesa de control.')).toBeInTheDocument();
	});

	test('loads products and orders, then transforms the orders table', async () => {
		mockGetByUrl({
			orders: [
				{
					id: 2,
					payment_method: 'cash',
					status: 'Programada',
					driver: 'Driver 2',
					cart_items: [ { product: 'Agua', quantity: '1' } ]
				},
				{
					id: 1,
					payment_method: 'PAID',
					status: 'Error',
					driver: 'Driver 1',
					cart_items: [
						{ product: 'Agua', quantity: '2' },
						{ product: 'Pan', quantity: '1' }
					]
				}
			],
			products: [
				{ id: 1, name: 'Agua' },
				{ id: 2, name: 'Pan' }
			]
		});

		renderWithProviders(<OrdersView />, { route: '/admin/orders' });

		await waitFor(() => {
			expect(screen.getByTestId('orders-view')).toBeInTheDocument();
		});

		expect(lastOrdersProps.tableData).toEqual([
			expect.objectContaining({
				id: 1,
				payment_method: 'Pagada',
				order: 'Ver detalles',
				status: 'Error'
			}),
			expect.objectContaining({
				id: 2,
				payment_method: 'cash',
				order: 'Ver detalles',
				status: 'Programada'
			})
		]);
		expect(lastOrdersProps.productsAvailable).toEqual([
			{ id: 1, name: 'Agua', label: 'Agua', value: 'Agua' },
			{ id: 2, name: 'Pan', label: 'Pan', value: 'Pan' }
		]);
		expect(lastOrdersProps.listOfConsolidatedProducts).toEqual({
			'Driver 1': { Agua: 2, Pan: 1 },
			'Driver 2': { Agua: 1 }
		});
	});

	test('changes the date and fetches orders for the selected day', async () => {
		mockGetByUrl({ orders: [], products: [] });

		const { history } = renderWithProviders(<OrdersView />, { route: '/admin/orders?date=2026-04-10' });

		await waitFor(() => {
			expect(lastOrdersProps).toBeDefined();
		});

		axios.get.mockImplementation((url, config) => {
			if (url === 'https://api.example.com/orders') {
				return Promise.resolve({ data: [ { id: 9, payment_method: 'cash', status: 'Programada', cart_items: [] } ] });
			}

			if (url === 'https://api.example.com/products') {
				return Promise.resolve({ data: [] });
			}

			return Promise.reject(new Error(`Unexpected GET for ${url}`));
		});

		await act(async () => {
			lastOrdersProps.onDateSelect({ value: '2026-04-20' });
		});

		await waitFor(() => {
			expect(history.location.pathname).toBe('/admin/orders');
			expect(history.location.search).toBe('?date=2026-04-20');
		});
		expect(axios.get).toHaveBeenCalledWith('https://api.example.com/orders', expect.objectContaining({
			params: { date: '2026-04-20' }
		}));
	});

	test('creates, updates, and deletes orders through the table callbacks', async () => {
		mockGetByUrl({ orders: [], products: [] });
		axios.post.mockResolvedValue({
			data: {
				id: 1,
				status: 'Programada',
				errors: [],
				driver: 'Driver 1',
				latitude: 19.4,
				longitude: -99.1
			}
		});
		axios.put.mockResolvedValue({
			data: {
				id: 1,
				status: 'Reprogramada',
				errors: [ 'route' ],
				driver: 'Driver 2',
				latitude: 19.5,
				longitude: -99.2
			}
		});
		axios.delete.mockResolvedValue({ data: {} });

		renderWithProviders(<OrdersView />, { route: '/admin/orders?date=2026-04-18' });

		await waitFor(() => {
			expect(lastOrdersProps).toBeDefined();
		});

		const newOrder = { delivery_date: '2026-04-18', cart_items: [], payment_method: 'cash' };

		await act(async () => {
			await lastOrdersProps.onOrderCreated(newOrder);
		});

		await waitFor(() => {
			expect(lastOrdersProps.tableData).toHaveLength(1);
		});
		expect(screen.getByText('Orden guardada en la base de datos')).toBeInTheDocument();

		await act(async () => {
			await lastOrdersProps.onOrderUpdated({
				item: {
					...lastOrdersProps.tableData[0],
					original_date: '2026-04-18',
					delivery_date: '2026-04-18'
				},
				rowIndex: 0
			});
		});

		await waitFor(() => {
			expect(lastOrdersProps.tableData[0]).toEqual(expect.objectContaining({
				status: 'Reprogramada',
				driver: 'Driver 2'
			}));
		});

		await act(async () => {
			await lastOrdersProps.onOrderDeleted({
				item: lastOrdersProps.tableData[0],
				rowIndex: 0
			});
		});

		await waitFor(() => {
			expect(lastOrdersProps.tableData).toEqual([]);
		});
	});

	test('schedules orders with the selected driver and delegates processing', async () => {
		mockGetByUrl({
			orders: [
				{ id: 1, driver: null, cart_items: [ { product: 'Agua', quantity: '2' } ], payment_method: 'cash' }
			],
			products: []
		});
		DeliveryProcessor.mockImplementation((selectedDrivers, orders) => orders.map((order, index) => ({
			...order,
			delivery_sequence: index + 1
		})));

		renderWithProviders(<OrdersView />, { route: '/admin/orders' });

		await waitFor(() => {
			expect(lastOrdersProps.tableData).toHaveLength(1);
		});

		act(() => {
			lastOrdersProps.onOrdersScheduled([ 'Driver 1' ]);
		});

		expect(DeliveryProcessor).toHaveBeenCalledWith([ 'Driver 1' ], [
			expect.objectContaining({ id: 1, driver: 'Driver 1' })
		]);
		expect(lastOrdersProps.tableData[0]).toEqual(expect.objectContaining({
			driver: 'Driver 1',
			delivery_sequence: 1
		}));
	});

	test('validates clients and saves generated routes', async () => {
		mockGetByUrl({
			orders: [
					{ id: 1, driver: 'Driver 1', status: 'Programada', delivery_sequence: null, payment_method: 'cash', cart_items: [] }
			],
			products: [],
			clients: {
				phone_number: '5551234',
				name: 'Ana García',
				address: 'Calle 1',
				address_latitude: 19.1,
				address_longitude: -99.1,
				second_address: 'Calle 2',
				second_address_latitude: 19.2,
				second_address_longitude: -99.2,
				email: 'ana@example.com',
				discount: 10
			}
		});
		axios.post.mockResolvedValue({ status: 200 });

		renderWithProviders(<OrdersView />, { route: '/admin/orders' });

		await waitFor(() => {
			expect(lastOrdersProps.tableData).toHaveLength(1);
		});

		let mappedClient;
		await act(async () => {
			mappedClient = await lastOrdersProps.onValidateClient('5551234');
		});

		expect(mappedClient).toEqual(expect.objectContaining({
			clientPhoneNumber: '5551234',
			clientName: 'Ana García'
		}));

		await act(async () => {
			await lastOrdersProps.onRouteSelected([
				{ id: 1, status: 'Programada', delivery_sequence: 3, driver: 'Driver 1' }
			]);
		});

		await waitFor(() => {
			expect(lastOrdersProps.tableData[0]).toEqual(expect.objectContaining({
				delivery_sequence: 3,
				driver: 'Driver 1'
			}));
		});
		expect(screen.getByText('Ruta creada con éxito.')).toBeInTheDocument();
	});
});