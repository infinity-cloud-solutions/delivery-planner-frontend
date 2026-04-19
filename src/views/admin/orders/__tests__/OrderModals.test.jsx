import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('react-select', () => (props) => {
	const currentValue = typeof props.value === 'object'
		? props.value?.value?.value || props.value?.value || props.value?.label || ''
		: props.value || '';

	return (
		<select
			aria-label={props.placeholder}
			data-testid={props.placeholder}
			value={currentValue}
			disabled={props.isDisabled}
			onChange={(event) => {
				const selectedOption = props.options.find((option) => String(option.value) === event.target.value);
				props.onChange(selectedOption);
			}}
		>
			<option value=''>{props.placeholder}</option>
			{props.options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
});

jest.mock('security.js', () => ({
	isAdmin: jest.fn()
}));

import CreateOrderModal from '../components/CreateOrderModal';
import UpdateOrderModal from '../components/UpdateOrderModal';
import { isAdmin } from 'security.js';
import theme from 'theme/theme';

const renderInTheme = (ui) => render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

const productsAvailable = [
	{ value: 'Mango', label: 'Mango', price: 100 },
	{ value: 'Piña', label: 'Piña', price: 80 }
];

const getNextWeekday = () => {
	const date = new Date();
	date.setDate(date.getDate() + 2);
	while (date.getDay() === 0 || date.getDay() === 6) {
		date.setDate(date.getDate() + 1);
	}
	return date.toISOString().slice(0, 10);
};

const futureWeekday = getNextWeekday();

const baseRowData = {
	index: 2,
	row: {
		id: 'order-1',
		client_name: 'Marco Burgos',
		delivery_time: '9 AM - 1 PM',
		delivery_address: 'Av Juarez 123',
		latitude: 20.67,
		longitude: -103.35,
		phone_number: '4491234567',
		payment_method: 'Tarjeta',
		cart_items: [{ product: 'Mango', quantity: 2, price: 100 }],
		delivery_date: futureWeekday,
		notes: 'Llamar al llegar',
		driver: 1,
		total_amount: '200',
		discount: '5'
	}
};

describe('Order modals', () => {
	beforeEach(() => {
		isAdmin.mockReturnValue(true);
		jest.setTimeout(10000);
	});

	afterEach(() => {
		jest.setTimeout(5000);
	});

	test('creates an order from a validated phone number and existing client branch can choose the second address', async () => {
		const onClose = jest.fn();
		const onCreate = jest.fn().mockResolvedValue(undefined);
		const onClientExistsCheck = jest.fn()
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({
				clientName: 'Cliente Existente',
				clientAddress: 'Casa Matriz',
				clientLatitude: '20.67',
				clientLongitude: '-103.35',
				clientSecondAddress: 'Sucursal Centro',
				clientSecondLatitude: '20.68',
				clientSecondLongitude: '-103.36',
				clientDiscount: '10'
			});

		const firstView = renderInTheme(
			<CreateOrderModal
				isOpen
				onClose={onClose}
				onCreate={onCreate}
				productsAvailable={productsAvailable}
				onClientExistsCheck={onClientExistsCheck}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Si el cliente existe, usaramos la información previamente salvada'), { target: { value: '4491234567' } });
		fireEvent.blur(screen.getByPlaceholderText('Si el cliente existe, usaramos la información previamente salvada'));

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Nombre y apellido')).toBeInTheDocument();
		});

		const createSelects = document.querySelectorAll('select');
		const createDateInput = document.querySelector('input[type="date"]');

		fireEvent.change(screen.getByPlaceholderText('Nombre y apellido'), { target: { value: 'Marco Burgos' } });
		fireEvent.change(createSelects[0], { target: { value: '5' } });
		fireEvent.change(screen.getByPlaceholderText('Formato similar al de Google Maps'), { target: { value: 'Av Vallarta 456' } });
		fireEvent.change(createDateInput, { target: { value: futureWeekday } });
		fireEvent.change(createSelects[1], { target: { value: '9 AM - 1 PM' } });
		fireEvent.change(createSelects[2], { target: { value: 'Tarjeta' } });
		fireEvent.change(screen.getByTestId('Buscar producto'), { target: { value: 'Mango' } });
		fireEvent.change(screen.getByPlaceholderText('Ingresa la cantidad'), { target: { value: '2' } });
		fireEvent.click(screen.getByText('Agregar al carrito'));

		fireEvent.click(screen.getByText('Agregar notas'));
		fireEvent.change(screen.getByPlaceholderText('Instrucciones para la entrega'), { target: { value: 'Tocar puerta' } });

		await waitFor(() => {
			expect(screen.getByText('Monto total: $190.00')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Guardar orden'));

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledWith({
				client_name: 'Marco Burgos',
				delivery_address: 'Av Vallarta 456',
				delivery_date: futureWeekday,
				delivery_time: '9 AM - 1 PM',
				phone_number: '4491234567',
				total_amount: 190,
				cart_items: [{ product: 'Mango', quantity: 2, price: 100 }],
				payment_method: 'Tarjeta',
				status: 'Creada',
				order: 'Ver detalles',
				notes: 'Tocar puerta',
				discount: '5',
				geolocation: null
			});
		});
		expect(onClose).toHaveBeenCalledTimes(1);

		firstView.unmount();

		renderInTheme(
			<CreateOrderModal
				isOpen
				onClose={onClose}
				onCreate={onCreate}
				productsAvailable={productsAvailable}
				onClientExistsCheck={onClientExistsCheck}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Si el cliente existe, usaramos la información previamente salvada'), { target: { value: '4497654321' } });
		fireEvent.blur(screen.getByPlaceholderText('Si el cliente existe, usaramos la información previamente salvada'));

		await waitFor(() => {
			expect(screen.getByText('Cliente encontrado')).toBeInTheDocument();
		});
		fireEvent.click(screen.getByText('Sucursal Centro'));
		fireEvent.click(screen.getByText('Aceptar'));

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Formato similar al de Google Maps')).toHaveValue('Sucursal Centro');
		});
	});

	test('updates and deletes an order, and hides admin controls for non-admin users', async () => {
		const onClose = jest.fn();
		const onUpdate = jest.fn().mockResolvedValue(undefined);
		const onDelete = jest.fn().mockResolvedValue(undefined);

		const firstView = renderInTheme(
			<UpdateOrderModal
				isOpen
				onClose={onClose}
				rowData={baseRowData}
				onUpdate={onUpdate}
				onDelete={onDelete}
				productsAvailable={productsAvailable}
			/>
		);

		await waitFor(() => {
			expect(screen.getByText('Monto total: $190.00')).toBeInTheDocument();
		});

		const updateSelects = document.querySelectorAll('select');

		fireEvent.change(screen.getByPlaceholderText('Formato similar al de Google Maps'), { target: { value: 'Av Patria 999' } });
		fireEvent.change(updateSelects[1], { target: { value: '2' } });
		fireEvent.change(updateSelects[0], { target: { value: '10' } });
		fireEvent.change(updateSelects[3], { target: { value: 'Efectivo' } });
		fireEvent.click(screen.getByText('Ver notas'));
		fireEvent.change(screen.getByPlaceholderText('Instrucciones para la entrega'), { target: { value: 'Nueva nota' } });

		await waitFor(() => {
			expect(screen.getByText('Monto total: $180.00')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Actualizar'));

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalledWith({
				item: {
					id: 'order-1',
					client_name: 'Marco Burgos',
					delivery_address: 'Av Patria 999',
					geolocation: { latitude: 20.67, longitude: -103.35 },
					delivery_date: futureWeekday,
					delivery_time: '9 AM - 1 PM',
					phone_number: '4491234567',
					total_amount: 180,
					cart_items: [{ product: 'Mango', quantity: 2, price: 100 }],
					payment_method: 'Efectivo',
					notes: 'Nueva nota',
					status: 'Creada',
					order: 'Ver detalles',
					original_date: futureWeekday,
					driver: 2,
					original_driver: 1,
					discount: '10'
				},
				rowIndex: 2
			});
		});
		expect(onClose).toHaveBeenCalledTimes(1);

		firstView.unmount();

		const secondView = renderInTheme(
			<UpdateOrderModal
				isOpen
				onClose={onClose}
				rowData={baseRowData}
				onUpdate={onUpdate}
				onDelete={onDelete}
				productsAvailable={productsAvailable}
			/>
		);

		fireEvent.click(screen.getByText('Eliminar'));
		await waitFor(() => {
			expect(screen.getByText('Confirmar Acción')).toBeInTheDocument();
		});
		fireEvent.click(screen.getByText('Confirmar'));
		await waitFor(() => {
			expect(onDelete).toHaveBeenCalledWith({
				item: { id: 'order-1', delivery_date: futureWeekday },
				rowIndex: 2
			});
		});

		secondView.unmount();

		isAdmin.mockReturnValue(false);
		renderInTheme(
			<UpdateOrderModal
				isOpen
				onClose={onClose}
				rowData={baseRowData}
				onUpdate={onUpdate}
				onDelete={onDelete}
				productsAvailable={productsAvailable}
			/>
		);

		expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
		expect(screen.getAllByDisplayValue('20.67')[0]).toBeDisabled();
		expect(screen.getAllByDisplayValue('-103.35')[0]).toBeDisabled();
	}, 15000);
});