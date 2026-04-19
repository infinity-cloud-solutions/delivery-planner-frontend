import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import DeliveriesView from '../deliveries';
import { renderWithProviders, createDeferred } from 'test/testUtils';
import { getAccessToken, getEmailFromToken, validateJWT } from 'security.js';
import { getDateAsQueryParam } from 'utils/Utility';

jest.mock('axios', () => ({
	get: jest.fn(),
	put: jest.fn()
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

let mockLatestDeliveryProps = [];

jest.mock('views/driver/deliveries/components/Delivery', () => (props) => {
	mockLatestDeliveryProps = [ ...mockLatestDeliveryProps, props ];

	return (
		<div data-testid='delivery-card'>
			<div>{`order:${props.order.id}`}</div>
			<div>{`status:${props.order.status}`}</div>
			<div>{`payment:${props.order.payment_method}`}</div>
			<div>{`products:${JSON.stringify(props.listOfConsolidatedProducts)}`}</div>
			<button
				type='button'
				onClick={() =>
					props.onUpdateDelivery(
						{ ...props.order, status: 'En ruta' },
						props.order.id,
						'En ruta'
					)
				}>
				mark en ruta
			</button>
			<button
				type='button'
				onClick={() =>
					props.onUpdateDelivery(
						{ ...props.order, status: 'Entregada' },
						props.order.id,
						'Entregada'
					)
				}>
				mark entregada
			</button>
			<button
				type='button'
				onClick={() =>
					props.onUpdateDelivery(
						{ ...props.order, status: 'Reprogramada' },
						props.order.id,
						'Reprogramada'
					)
				}>
				reprogramar
			</button>
		</div>
	);
});

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	getEmailFromToken: jest.fn(),
	validateJWT: jest.fn()
}));

jest.mock('utils/Utility', () => ({
	...jest.requireActual('utils/Utility'),
	getDateAsQueryParam: jest.fn()
}));

describe('Driver deliveries view', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLatestDeliveryProps = [];
		process.env.REACT_APP_ORDERS_BASE_URL = 'https://api.example.com/orders';
		process.env.REACT_APP_DRIVERS_MAP = JSON.stringify({
			'driver@example.com': 2
		});
		getAccessToken.mockReturnValue('jwt-token');
		getEmailFromToken.mockReturnValue('driver@example.com');
		getDateAsQueryParam.mockReturnValue('2026-04-18');
		validateJWT.mockReturnValue(true);
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('shows a loading spinner while the deliveries request is pending', () => {
		const deferredRequest = createDeferred();
		axios.get.mockReturnValue(deferredRequest.promise);

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	test('filters, normalizes, sorts, and consolidates deliveries for the mapped driver', async () => {
		axios.get.mockResolvedValue({
			data: [
				{
					id: 1,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '3 PM - 6 PM',
					delivery_sequence: 2,
					driver: 2,
					cart_items: [ { product: 'Mango', quantity: '1' } ]
				},
				{
					id: 2,
					payment_method: 'PAID',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '9 AM - 1 PM',
					delivery_sequence: 5,
					driver: 2,
					cart_items: [ { product: 'Mango', quantity: '2' } ]
				},
				{
					id: 3,
					payment_method: 'card',
					status: 'En ruta',
					delivery_date: '2026-04-18',
					delivery_time: '3 PM - 6 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: [ { product: 'Fresa', quantity: '4' } ]
				},
				{
					id: 4,
					payment_method: 'cash',
					status: 'Entregada',
					delivery_date: '2026-04-18',
					delivery_time: '9 AM - 1 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				},
				{
					id: 5,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '9 AM - 1 PM',
					delivery_sequence: 1,
					driver: 1,
					cart_items: []
				}
			]
		});

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		await waitFor(() => {
			expect(screen.getAllByTestId('delivery-card')).toHaveLength(3);
		});

		expect(axios.get).toHaveBeenCalledWith('https://api.example.com/orders', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer jwt-token'
			},
			params: {
				date: '2026-04-18'
			}
		});
		expect(screen.getAllByText(/order:/).map((node) => node.textContent)).toEqual([
			'order:2',
			'order:3',
			'order:1'
		]);
		expect(screen.getByText('payment:Pagada')).toBeInTheDocument();
		expect(screen.getAllByText('products:{"2":{"Mango":3,"Fresa":4}}')).toHaveLength(3);
	});

	test('falls back to the empty state when no orders match the current driver mapping', async () => {
		process.env.REACT_APP_DRIVERS_MAP = '{}';
		axios.get.mockResolvedValue({
			data: [
				{
					id: 7,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '9 AM - 1 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				}
			]
		});

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		expect(
			await screen.findByText('Aún no hay órdenes programadas para este día. Vuelve más tarde.')
		).toBeInTheDocument();
		expect(screen.queryByTestId('delivery-card')).not.toBeInTheDocument();
	});

	test('logs request failures and shows the empty state', async () => {
		axios.get.mockRejectedValue(new Error('deliveries failed'));

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		expect(
			await screen.findByText('Aún no hay órdenes programadas para este día. Vuelve más tarde.')
		).toBeInTheDocument();
		expect(console.error).toHaveBeenCalledWith('API error:', expect.any(Error));
	});

	test('redirects to auth when a delivery update is attempted with an invalid jwt', async () => {
		validateJWT.mockReturnValue(false);
		axios.get.mockResolvedValue({
			data: [
				{
					id: 8,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '9 AM - 1 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				}
			]
		});

		const { history } = renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		await screen.findByTestId('delivery-card');
		fireEvent.click(screen.getByRole('button', { name: 'mark en ruta' }));

		expect(history.location.pathname).toBe('/auth');
		expect(axios.put).not.toHaveBeenCalled();
	});

	test('updates a delivery in place and clears the success alert after the timeout', async () => {
		axios.get.mockResolvedValue({
			data: [
				{
					id: 9,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '3 PM - 6 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				}
			]
		});
		axios.put.mockResolvedValue({ status: 200 });
		const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		await screen.findByTestId('delivery-card');
		fireEvent.click(screen.getByRole('button', { name: 'mark en ruta' }));

		await waitFor(() => {
			expect(screen.getByText('status:En ruta')).toBeInTheDocument();
		});
		expect(screen.getByText('Orden actualizada en la base de datos')).toBeInTheDocument();

		const dismissAlert = setTimeoutSpy.mock.calls.find(([, delay]) => delay === 3000)?.[0];

		act(() => {
			dismissAlert();
		});

		await waitFor(() => {
			expect(screen.queryByText('Orden actualizada en la base de datos')).not.toBeInTheDocument();
		});
	});

	test('removes a delivery after it is marked as delivered or rescheduled', async () => {
		axios.get.mockResolvedValue({
			data: [
				{
					id: 10,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '3 PM - 6 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				}
			]
		});
		axios.put.mockResolvedValue({ status: 200 });

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		await screen.findByTestId('delivery-card');
		fireEvent.click(screen.getByRole('button', { name: 'mark entregada' }));

		expect(
			await screen.findByText('Aún no hay órdenes programadas para este día. Vuelve más tarde.')
		).toBeInTheDocument();

		axios.get.mockResolvedValue({
			data: [
				{
					id: 11,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '3 PM - 6 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				}
			]
		});

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		await screen.findByTestId('delivery-card');
		fireEvent.click(screen.getByRole('button', { name: 'reprogramar' }));

		expect(
			await screen.findByText('Aún no hay órdenes programadas para este día. Vuelve más tarde.')
		).toBeInTheDocument();
	});

	test('logs non-200 responses and shows an error alert when updates fail', async () => {
		axios.get.mockResolvedValue({
			data: [
				{
					id: 12,
					payment_method: 'cash',
					status: 'Programada',
					delivery_date: '2026-04-18',
					delivery_time: '3 PM - 6 PM',
					delivery_sequence: 1,
					driver: 2,
					cart_items: []
				}
			]
		});
		axios.put.mockResolvedValueOnce({
			status: 500,
			statusText: 'Server Error'
		});
		axios.put.mockRejectedValueOnce(new Error('update failed'));
		const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

		renderWithProviders(<DeliveriesView />, { route: '/driver/deliveries' });

		await screen.findByTestId('delivery-card');
		fireEvent.click(screen.getByRole('button', { name: 'mark en ruta' }));

		await waitFor(() => {
			expect(console.error).toHaveBeenCalledWith('Error updating order:', 'Server Error');
		});

		fireEvent.click(screen.getByRole('button', { name: 'mark en ruta' }));

		expect(await screen.findByText('Error al actualizar la orden. Intenta de nuevo.')).toBeInTheDocument();

		const dismissAlert = setTimeoutSpy.mock.calls.find(([, delay]) => delay === 3000)?.[0];

		act(() => {
			dismissAlert();
		});

		await waitFor(() => {
			expect(screen.queryByText('Error al actualizar la orden. Intenta de nuevo.')).not.toBeInTheDocument();
		});
		expect(console.error).toHaveBeenCalledWith('Error updating order:', expect.any(Error));
	});
});