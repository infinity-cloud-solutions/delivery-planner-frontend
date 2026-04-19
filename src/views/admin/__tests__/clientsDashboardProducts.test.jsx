import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useHistory } from 'react-router-dom';

jest.mock('components/menu/MainMenu', () => () => <div data-testid='mock-main-menu' />);

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn()
}));

jest.mock('security.js', () => ({
	isAdmin: jest.fn(),
	validateJWT: jest.fn()
}));

import OrdersDashboard from '../dashboard/components/OrdersDashboard';
import CreateClientModal from '../clients/components/CreateClientModal';
import UpdateProductModal from '../products/components/UpdateProductModal';
import { columnsOrdersDashboard } from '../dashboard/variables/columnsData';
import { isAdmin, validateJWT } from 'security.js';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Admin dashboard, clients, and products helpers', () => {
	beforeEach(() => {
		useHistory.mockReturnValue({ push: jest.fn() });
		isAdmin.mockReturnValue(true);
		validateJWT.mockReturnValue(false);
	});

	test('renders the orders dashboard empty state and current rows, and navigates to all orders', () => {
		const push = jest.fn();
		useHistory.mockReturnValue({ push });

		const { rerender } = renderInTheme(<OrdersDashboard columnsData={columnsOrdersDashboard} tableData={[]} />);

		expect(screen.getByText('No hay registros para mostrar.')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Ver todas'));
		expect(push).toHaveBeenCalledWith('/admin/orders');

		rerender(
			<ChakraProvider theme={theme}>
				<OrdersDashboard
					columnsData={columnsOrdersDashboard}
					tableData={[
						{ name_display: 'Marco Burgos', client_name: 'Marco Burgos', status: 'Programada', total_amount: 450.5, payment_method: 'Tarjeta' },
						{ name_display: 'Ana Gómez', client_name: 'Ana Gómez', status: 'Entregada', total_amount: 200, payment_method: 'Efectivo' },
						{ name_display: 'Luis Pérez', client_name: 'Luis Pérez', status: 'Error', total_amount: 99, payment_method: 'Transferencia' },
						{ name_display: 'Sara Ruiz', client_name: 'Sara Ruiz', status: 'Reprogramada', total_amount: 120, payment_method: 'Pagada' }
					]}
				/>
			</ChakraProvider>
		);

		expect(screen.getByText('Marco Burgos')).toBeInTheDocument();
		expect(screen.getByText('Entregada')).toBeInTheDocument();
		expect(screen.getByText('Error')).toBeInTheDocument();
		expect(screen.getByText('Reprogramada')).toBeInTheDocument();
		expect(screen.getByText('$450.50')).toBeInTheDocument();
		expect(screen.getByText('Pagada')).toBeInTheDocument();
	});

	test('creates a new client after phone validation and handles existing clients', async () => {
		const onClose = jest.fn();
		const onCreate = jest.fn().mockResolvedValue(undefined);
		const onClientExistsCheck = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
			clientName: 'Cliente Existente',
			clientAddress: 'Calle 2',
			clientEmail: 'existente@hiberry.mx',
			clientDiscount: '10'
		});

		const view = renderInTheme(
			<CreateClientModal isOpen onClose={onClose} onCreate={onCreate} onClientExistsCheck={onClientExistsCheck} />
		);

		const phoneInput = screen.getByPlaceholderText('Identificador único de cada cliente');
		fireEvent.change(phoneInput, { target: { value: '4491234567' } });
		fireEvent.blur(phoneInput);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Nombre y apellido')).toBeInTheDocument();
		});

		fireEvent.change(screen.getByPlaceholderText('Nombre y apellido'), { target: { value: 'Marco Burgos' } });
		fireEvent.change(screen.getByPlaceholderText('Formato similar al que aparece en Google Maps'), { target: { value: 'Av Juárez 123' } });
		fireEvent.change(screen.getByPlaceholderText('Ingresa la dirección de correo electrónico'), { target: { value: 'marco@hiberry.mx' } });
		fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });
		fireEvent.click(screen.getByText('Guardar'));

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledWith({
				phone_number: '4491234567',
				name: 'Marco Burgos',
				address: 'Av Juárez 123',
				address_geolocation: null,
				second_address: null,
				second_address_geolocation: null,
				email: 'marco@hiberry.mx',
				discount: '5'
			});
		});
		expect(onClose).toHaveBeenCalledTimes(1);

		view.unmount();
		renderInTheme(<CreateClientModal isOpen onClose={onClose} onCreate={onCreate} onClientExistsCheck={onClientExistsCheck} />);

		const secondPhoneInput = screen.getByPlaceholderText('Identificador único de cada cliente');
		fireEvent.change(secondPhoneInput, { target: { value: '4497654321' } });
		fireEvent.blur(secondPhoneInput);

		await waitFor(() => {
			expect(screen.getByText('El cliente con este número de teléfono ya existe.')).toBeInTheDocument();
		});
		expect(screen.getByPlaceholderText('Nombre y apellido')).toBeDisabled();
		expect(screen.getByText('Guardar')).toBeDisabled();
	});

	test('updates and deletes products while respecting admin permissions', async () => {
		const onClose = jest.fn();
		const onUpdate = jest.fn();
		const onDelete = jest.fn();
		const rowData = { index: 3, row: { id: 'prod-1', name: 'Mango', price: '180' } };

		const { rerender } = renderInTheme(
			<UpdateProductModal isOpen onClose={onClose} onUpdate={onUpdate} onDelete={onDelete} rowData={rowData} />
		);

		fireEvent.change(screen.getByPlaceholderText('Ingresa el nombre del producto'), { target: { value: 'Piña' } });
		fireEvent.change(screen.getByPlaceholderText('Ingresa el precio del producto'), { target: { value: '210' } });
		fireEvent.click(screen.getByText('Actualizar'));

		expect(onUpdate).toHaveBeenCalledWith({
			item: { id: 'prod-1', name: 'Piña', price: '210' },
			rowIndex: 3
		});
		expect(onClose).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText('Eliminar'));
		expect(onDelete).toHaveBeenCalledWith({
			item: { id: 'prod-1', name: 'Mango', price: '180' },
			rowIndex: 3
		});

		isAdmin.mockReturnValue(false);
		rerender(
			<ChakraProvider theme={theme}>
				<UpdateProductModal isOpen onClose={onClose} onUpdate={onUpdate} onDelete={onDelete} rowData={rowData} />
			</ChakraProvider>
		);

		expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
	});
});