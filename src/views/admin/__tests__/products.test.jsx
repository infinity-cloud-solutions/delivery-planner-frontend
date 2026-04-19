import React from 'react';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';

import ProductView from '../products';
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

let lastProductsProps;

const readRenderedProducts = () => JSON.parse(screen.getByTestId('products-view').textContent);

jest.mock('views/admin/products/components/Products', () => (props) => {
	lastProductsProps = props;
	return <div data-testid='products-view'>{JSON.stringify(props.tableData)}</div>;
});

jest.mock('views/admin/products/variables/tableColumnsProducts', () => ({
	tableColumnsProducts: [ { Header: 'Nombre', accessor: 'name' } ]
}));

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	isDriver: jest.fn(),
	validateJWT: jest.fn()
}));

describe('Products admin view', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		lastProductsProps = undefined;
		process.env.REACT_APP_PRODUCTS_BASE_URL = 'https://api.example.com/products';
		getAccessToken.mockReturnValue('jwt-token');
		isDriver.mockReturnValue(false);
		validateJWT.mockReturnValue(true);
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('redirects to auth when the jwt is invalid on mount', async () => {
		validateJWT.mockReturnValue(false);

		const { history } = renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(history.location.pathname).toBe('/auth');
		});
		expect(axios.get).not.toHaveBeenCalled();
	});

	test('renders the restricted state for drivers', async () => {
		isDriver.mockReturnValue(true);
		axios.get.mockResolvedValue({ data: [] });

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		expect(await screen.findByText('El contenido está restringido para administradores y mesa de control.')).toBeInTheDocument();
	});

	test('loads products and passes them to the products table', async () => {
		axios.get.mockResolvedValue({
			data: [
				{ id: 1, name: 'Tomate' },
				{ id: 2, name: 'Lechuga' }
			]
		});

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(screen.getByTestId('products-view')).toBeInTheDocument();
		});

		expect(readRenderedProducts()).toEqual([
			{ id: 1, name: 'Tomate' },
			{ id: 2, name: 'Lechuga' }
		]);
	});

	test('renders an empty table when no products are returned', async () => {
		axios.get.mockResolvedValue({ data: [] });

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(screen.getByTestId('products-view')).toBeInTheDocument();
		});

		expect(readRenderedProducts()).toEqual([]);
	});

	test('logs fetch failures and keeps the view mounted', async () => {
		axios.get.mockRejectedValue(new Error('products failed'));

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(screen.getByTestId('products-view')).toBeInTheDocument();
		});

		expect(console.error).toHaveBeenCalledWith('API error:', expect.any(Error));
		expect(readRenderedProducts()).toEqual([]);
	});

	test('creates a product and shows a success alert', async () => {
		axios.get.mockResolvedValue({ data: [] });
		axios.post.mockResolvedValue({ data: { id: 7 } });

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(lastProductsProps).toBeDefined();
		});

		await act(async () => {
			lastProductsProps.onProductCreated({ name: 'Jitomate', price: 20 });
		});

		await waitFor(() => {
			expect(readRenderedProducts()).toEqual([ { id: 7, name: 'Jitomate', price: 20 } ]);
		});
		expect(screen.getByText('Producto guardado en la base de datos')).toBeInTheDocument();
	});

	test('shows an error alert when product creation fails', async () => {
		axios.get.mockResolvedValue({ data: [] });
		axios.post.mockRejectedValue(new Error('create failed'));

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(lastProductsProps).toBeDefined();
		});

		await act(async () => {
			lastProductsProps.onProductCreated({ name: 'Jitomate' });
		});

		expect(await screen.findByText('Error al crear producto. Intenta de nuevo.')).toBeInTheDocument();
	});

	test('updates an existing product in place', async () => {
		axios.get.mockResolvedValue({ data: [ { id: 1, name: 'Tomate' } ] });
		axios.put.mockResolvedValue({ data: {} });

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(readRenderedProducts()).toEqual([ { id: 1, name: 'Tomate' } ]);
		});

		await act(async () => {
			lastProductsProps.onProductUpdated({ item: { id: 1, name: 'Tomate cherry' }, rowIndex: 0 });
		});

		await waitFor(() => {
			expect(readRenderedProducts()).toEqual([ { id: 1, name: 'Tomate cherry' } ]);
		});
	});

	test('removes a product from the table after deletion', async () => {
		axios.get.mockResolvedValue({ data: [ { id: 1, name: 'Tomate' } ] });
		axios.delete.mockResolvedValue({ data: {} });

		renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(readRenderedProducts()).toEqual([ { id: 1, name: 'Tomate' } ]);
		});

		await act(async () => {
			lastProductsProps.onProductDeleted({ item: { id: 1 }, rowIndex: 0 });
		});

		await waitFor(() => {
			expect(readRenderedProducts()).toEqual([]);
		});
	});

	test('redirects to auth instead of creating a product when the jwt later becomes invalid', async () => {
		validateJWT.mockReturnValueOnce(true).mockReturnValueOnce(false);
		axios.get.mockResolvedValue({ data: [] });

		const { history } = renderWithProviders(<ProductView />, { route: '/admin/products' });

		await waitFor(() => {
			expect(lastProductsProps).toBeDefined();
		});

		act(() => {
			lastProductsProps.onProductCreated({ name: 'No autorizado' });
		});

		expect(history.location.pathname).toBe('/auth');
		expect(axios.post).not.toHaveBeenCalled();
	});
});