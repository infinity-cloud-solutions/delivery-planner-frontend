import React from 'react';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';

import ClientView from '../clients';
import { renderWithProviders } from 'test/testUtils';
import { getAccessToken, isDriver, validateJWT } from 'security.js';

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

let lastClientsProps;

jest.mock('views/admin/clients/components/Clients', () => (props) => {
	lastClientsProps = props;
	return <div data-testid='clients-view'>clients</div>;
});

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	isDriver: jest.fn(),
	validateJWT: jest.fn()
}));

describe('Clients admin view', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		lastClientsProps = undefined;
		process.env.REACT_APP_CLIENTS_BASE_URL = 'https://api.example.com/clients';
		getAccessToken.mockReturnValue('jwt-token');
		isDriver.mockReturnValue(false);
		validateJWT.mockReturnValue(true);
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('redirects to auth when the jwt is invalid on mount', async () => {
		validateJWT.mockReturnValue(false);

		const { history } = renderWithProviders(<ClientView />, { route: '/admin/clients' });

		await waitFor(() => {
			expect(history.location.pathname).toBe('/auth');
		});
	});

	test('renders the restricted state for drivers', () => {
		isDriver.mockReturnValue(true);

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		expect(screen.getByText('El contenido está restringido para administradores y mesa de control.')).toBeInTheDocument();
	});

	test('maps fetched client data for the clients table', async () => {
		axios.get.mockResolvedValue({
			data: {
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

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		let mappedClient;
		await act(async () => {
			mappedClient = await lastClientsProps.onClientFetched('5551234');
		});

		expect(mappedClient).toEqual({
			clientPhoneNumber: '5551234',
			clientName: 'Ana García',
			clientAddress: 'Calle 1',
			clientLatitude: 19.1,
			clientLongitude: -99.1,
			clientSecondAddress: 'Calle 2',
			clientSecondLatitude: 19.2,
			clientSecondLongitude: -99.2,
			clientEmail: 'ana@example.com',
			clientDiscount: 10
		});
	});

	test('returns null when no client data is found', async () => {
		axios.get.mockResolvedValue({ data: null });

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		let mappedClient;
		await act(async () => {
			mappedClient = await lastClientsProps.onClientFetched('5551234');
		});

		expect(mappedClient).toBeNull();
		expect(console.log).toHaveBeenCalledWith('No client data found.');
	});

	test('returns null when client lookup fails', async () => {
		axios.get.mockRejectedValue(new Error('lookup failed'));

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		let mappedClient;
		await act(async () => {
			mappedClient = await lastClientsProps.onClientFetched('5551234');
		});

		expect(mappedClient).toBeNull();
		expect(console.error).toHaveBeenCalledWith('API error:', expect.any(Error));
	});

	test('creates a client and shows a success alert', async () => {
		axios.post.mockResolvedValue({ data: {} });

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		await act(async () => {
			await lastClientsProps.onClientCreated({ name: 'Ana García' });
		});

		expect(screen.getByText('Cliente guardado en la base de datos.')).toBeInTheDocument();
	});

	test('shows an error alert when client creation fails', async () => {
		const createError = new Error('create failed');
		axios.post.mockRejectedValue(createError);

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		let thrownError;
		await act(async () => {
			try {
				await lastClientsProps.onClientCreated({ name: 'Ana García' });
			} catch (error) {
				thrownError = error;
			}
		});

		expect(thrownError).toBe(createError);
		await waitFor(() => {
			expect(screen.getByText('Error al crear cliente. Intenta de nuevo.')).toBeInTheDocument();
		});
	});

	test('updates a client and shows a success alert', async () => {
		axios.put.mockResolvedValue({ data: {} });

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		await act(async () => {
			await lastClientsProps.onClientUpdated({ phone_number: '5551234' });
		});

		expect(screen.getByText('Cliente guardado en la base de datos.')).toBeInTheDocument();
	});

	test('shows an error alert when client updates fail', async () => {
		const updateError = new Error('update failed');
		axios.put.mockRejectedValue(updateError);

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		let thrownError;
		await act(async () => {
			try {
				await lastClientsProps.onClientUpdated({ phone_number: '5551234' });
			} catch (error) {
				thrownError = error;
			}
		});

		expect(thrownError).toBe(updateError);
		await waitFor(() => {
			expect(screen.getByText('Error al actualizar cliente. Intenta de nuevo.')).toBeInTheDocument();
		});
	});

	test('deletes a client and shows a success alert', async () => {
		axios.delete.mockResolvedValue({ data: {} });

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		await act(async () => {
			await lastClientsProps.onClientDeleted({ phone_number: '5551234' });
		});

		expect(screen.getByText('Cliente eliminado en la base de datos')).toBeInTheDocument();
	});

	test('shows an error alert when client deletion fails', async () => {
		const deleteError = new Error('delete failed');
		axios.delete.mockRejectedValue(deleteError);

		renderWithProviders(<ClientView />, { route: '/admin/clients' });

		let thrownError;
		await act(async () => {
			try {
				await lastClientsProps.onClientDeleted({ phone_number: '5551234' });
			} catch (error) {
				thrownError = error;
			}
		});

		expect(thrownError).toBe(deleteError);
		await waitFor(() => {
			expect(screen.getByText('Error al eliminar el cliente. Intenta de nuevo.')).toBeInTheDocument();
		});
	});
});