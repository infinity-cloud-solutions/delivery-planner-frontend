import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('axios', () => ({}));

jest.mock('components/card/Card', () => ({ children }) => <div data-testid='orders-card'>{children}</div>);
jest.mock('components/menu/MainMenu', () => ({ onDateSelect }) => (
	<div data-testid='orders-menu' onClick={() => onDateSelect('2024-10-10')}>
		menu
	</div>
));

jest.mock('../components/CreateOrderModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='create-order-modal'>
			<button type='button' onClick={() => props.onCreate({ id: 'created-order' })}>
				submit-create-order
			</button>
		</div>
	);
});

jest.mock('../components/UpdateOrderModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='update-order-modal'>
			<span>{props.rowData?.row?.client_name}</span>
			<button type='button' onClick={() => props.onUpdate({ item: props.rowData.row, rowIndex: props.rowData.index })}>
				submit-update-order
			</button>
			<button type='button' onClick={() => props.onDelete({ item: props.rowData.row, rowIndex: props.rowData.index })}>
				submit-delete-order
			</button>
		</div>
	);
});

jest.mock('../components/ConsolidatedModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return <div data-testid='consolidated-order-modal'>{props.products.length}</div>;
});

jest.mock('../components/MapModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='map-order-modal'>
			<button type='button' onClick={() => props.onConfirmRoute([{ id: 'route-1' }])}>
				confirm-route
			</button>
		</div>
	);
});

jest.mock('utils/Utility', () => ({
	useQueryParam: jest.fn(),
	getDateAsQueryParam: jest.fn()
}));

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	validateJWT: jest.fn()
}));

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn(() => ({ push: jest.fn() }))
}));

import Orders from '../components/Orders';
import { getAccessToken } from 'security.js';
import { getDateAsQueryParam, useQueryParam } from 'utils/Utility';
import theme from 'theme/theme';

const renderInTheme = (ui) => render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

const orderColumns = [
	{ Header: 'NOMBRE', accessor: 'client_name' },
	{ Header: 'TELÉFONO', accessor: 'phone_number' },
	{ Header: 'STATUS', accessor: 'status' },
	{ Header: 'HORARIO', accessor: 'delivery_time' },
	{ Header: 'PEDIDO', accessor: 'order' },
	{ Header: 'MONTO TOTAL', accessor: 'total_amount' },
	{ Header: 'MÉTODO DE PAGO', accessor: 'payment_method' },
	{ Header: 'CREADA', accessor: 'created_at' },
	{ Header: 'DIRECCIÓN', accessor: 'delivery_address' },
	{ Header: 'FECHA', accessor: 'delivery_date' },
	{ Header: 'REPARTIDOR', accessor: 'driver' },
	{ Header: 'SECUENCIA', accessor: 'delivery_sequence' }
];

const eligibleOrder = {
	id: 'order-1',
	client_name: 'Marco Burgos',
	phone_number: '4491234567',
	status: 'Creada',
	delivery_time: '9 AM - 1 PM',
	order: 'Ver detalles',
	total_amount: 200,
	payment_method: 'Tarjeta',
	created_at: '10:00',
	delivery_address: 'Av Juarez 123',
	delivery_date: '2024-10-10',
	driver: 1,
	delivery_sequence: null,
	discount: 10,
	errors: [],
	cart_items: [
		{ product: 'Mango', quantity: 2, price: 100 }
	]
};

describe('Orders component', () => {
	beforeEach(() => {
		getAccessToken.mockReturnValue('token');
		useQueryParam.mockReturnValue(null);
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		const formattedDate = `${year}-${month}-${day}`;
		getDateAsQueryParam.mockReturnValue(formattedDate);
	});

	test('renders the empty state and opens the create and consolidated order modals', async () => {
		const onOrderCreated = jest.fn().mockResolvedValue(undefined);

		renderInTheme(
			<Orders
				columnsData={orderColumns}
				tableData={[]}
				onOrderCreated={onOrderCreated}
				onOrderUpdated={jest.fn()}
				onOrderDeleted={jest.fn()}
				onOrdersScheduled={jest.fn()}
				onDateSelect={jest.fn()}
				productsAvailable={[]}
				listOfConsolidatedProducts={[{ name: 'Mango' }]}
				onValidateClient={jest.fn()}
				onRouteSelected={jest.fn()}
			/>
		);

		expect(screen.getByText('Pedidos para hoy')).toBeInTheDocument();
		expect(screen.getByText('No hay registros para mostrar.')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Crear ruta sugerida' })).toBeDisabled();

		fireEvent.click(screen.getByText('Ver consolidado'));
		expect(screen.getByTestId('consolidated-order-modal')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Crear'));
		expect(screen.getByTestId('create-order-modal')).toBeInTheDocument();
		fireEvent.click(screen.getByText('submit-create-order'));

		await waitFor(() => {
			expect(onOrderCreated).toHaveBeenCalledWith({ id: 'created-order' });
		});
	});

	test('opens the update modal, schedules routes, and forwards confirmed routes', async () => {
		const onOrderUpdated = jest.fn().mockResolvedValue(undefined);
		const onOrderDeleted = jest.fn().mockResolvedValue(undefined);
		const onOrdersScheduled = jest.fn().mockResolvedValue(undefined);
		const onRouteSelected = jest.fn().mockResolvedValue(undefined);

		renderInTheme(
			<Orders
				columnsData={orderColumns}
				tableData={[eligibleOrder]}
				onOrderCreated={jest.fn()}
				onOrderUpdated={onOrderUpdated}
				onOrderDeleted={onOrderDeleted}
				onOrdersScheduled={onOrdersScheduled}
				onDateSelect={jest.fn()}
				productsAvailable={[]}
				listOfConsolidatedProducts={[]}
				onValidateClient={jest.fn()}
				onRouteSelected={onRouteSelected}
			/>
		);

		expect(screen.getByText('$180.00')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Marco Burgos'));

		await waitFor(() => {
			expect(screen.getByTestId('update-order-modal')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('submit-update-order'));
		await waitFor(() => {
			expect(onOrderUpdated).toHaveBeenCalledWith({ item: eligibleOrder, rowIndex: 0 });
		});

		fireEvent.click(screen.getByText('submit-delete-order'));
		expect(onOrderDeleted).toHaveBeenCalledWith({ item: eligibleOrder, rowIndex: 0 });

		fireEvent.click(screen.getByText('Ver opciones avanzadas'));
		fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
		expect(screen.getByRole('button', { name: 'Crear ruta sugerida usando repartidor 1' })).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Crear ruta sugerida usando repartidor 1' }));
		await waitFor(() => {
			expect(onOrdersScheduled).toHaveBeenCalledWith([1]);
		});

		await waitFor(() => {
			expect(screen.getByTestId('map-order-modal')).toBeInTheDocument();
		});
		fireEvent.click(screen.getByText('confirm-route'));
		await waitFor(() => {
			expect(onRouteSelected).toHaveBeenCalledWith([{ id: 'route-1' }]);
		});
	});

	test('shows an alert when attempting to edit a programmed order', async () => {
		renderInTheme(
			<Orders
				columnsData={orderColumns}
				tableData={[
					{
						...eligibleOrder,
						id: 'order-2',
						client_name: 'Ana Gomez',
						status: 'Programada',
						delivery_sequence: 2
					}
				]}
				onOrderCreated={jest.fn()}
				onOrderUpdated={jest.fn()}
				onOrderDeleted={jest.fn()}
				onOrdersScheduled={jest.fn()}
				onDateSelect={jest.fn()}
				productsAvailable={[]}
				listOfConsolidatedProducts={[]}
				onValidateClient={jest.fn()}
				onRouteSelected={jest.fn()}
			/>
		);

		fireEvent.click(screen.getByText('Ana Gomez'));

		await waitFor(() => {
			expect(screen.getByText('No se puede editar una orden con estado diferente a "Creada" o "Reprogramada".')).toBeInTheDocument();
		});
		expect(screen.queryByTestId('update-order-modal')).not.toBeInTheDocument();
	});
});