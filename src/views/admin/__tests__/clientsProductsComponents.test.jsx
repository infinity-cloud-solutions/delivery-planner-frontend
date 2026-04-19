import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('axios', () => ({}));

jest.mock('views/admin/clients/components/CreateClientModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='create-client-modal'>
			<button type='button' onClick={() => props.onCreate({ phone_number: '4491111111' })}>
				submit-create-client
			</button>
			<button type='button' onClick={props.onClose}>
				close-create-client
			</button>
		</div>
	);
});

jest.mock('views/admin/clients/components/UpdateClientModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='mock-update-client-modal'>
			<span>{props.clientData?.clientName}</span>
			<button type='button' onClick={() => props.onUpdate({ phone_number: props.clientData.clientPhoneNumber })}>
				submit-update-client
			</button>
			<button type='button' onClick={() => props.onDelete({ phone_number: props.clientData.clientPhoneNumber })}>
				submit-delete-client
			</button>
			<button type='button' onClick={props.onClose}>
				close-update-client
			</button>
		</div>
	);
});

jest.mock('views/admin/products/components/CreateProductModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='create-product-modal'>
			<button type='button' onClick={() => props.onCreate({ item: { name: 'Nueva fruta', price: '80' } })}>
				submit-create-product
			</button>
		</div>
	);
});

jest.mock('views/admin/products/components/UpdateProductModal', () => (props) => {
	if (!props.isOpen) {
		return null;
	}

	return (
		<div data-testid='mock-update-product-modal'>
			<span>{props.rowData?.row?.name}</span>
			<button type='button' onClick={() => props.onUpdate({ item: props.rowData.row, rowIndex: props.rowData.index })}>
				submit-update-product
			</button>
			<button type='button' onClick={() => props.onDelete({ item: props.rowData.row, rowIndex: props.rowData.index })}>
				submit-delete-product
			</button>
			<button type='button' onClick={props.onClose}>
				close-update-product
			</button>
		</div>
	);
});

jest.mock('security.js', () => ({
	isAdmin: jest.fn(),
	getAccessToken: jest.fn(),
	validateJWT: jest.fn()
}));

import Clients from '../clients/components/Clients';
import Products from '../products/components/Products';
import { isAdmin } from 'security.js';
import theme from 'theme/theme';

const ActualUpdateClientModal = jest.requireActual('../clients/components/UpdateClientModal').default;

const renderInTheme = (ui) => render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

const productColumns = [
	{ Header: 'Nombre', accessor: 'name' },
	{ Header: 'Precio', accessor: 'price' }
];

const clientData = {
	clientPhoneNumber: '4491234567',
	clientName: 'Marco Burgos',
	clientAddress: 'Av Juarez 123',
	clientLatitude: '20.67',
	clientLongitude: '-103.35',
	clientSecondAddress: 'Sucursal Centro',
	clientSecondLatitude: '20.68',
	clientSecondLongitude: '-103.36',
	clientEmail: 'marco@hiberry.mx',
	clientDiscount: '10'
};

describe('Admin clients and products components', () => {
	beforeEach(() => {
		isAdmin.mockReturnValue(true);
	});

	test('creates, finds, updates, and deletes clients through Clients component callbacks', async () => {
		const onClientCreated = jest.fn().mockResolvedValue(undefined);
		const onClientUpdated = jest.fn().mockResolvedValue(undefined);
		const onClientDeleted = jest.fn().mockResolvedValue(undefined);
		const onClientFetched = jest.fn().mockResolvedValue(clientData);

		renderInTheme(
			<Clients
				onClientCreated={onClientCreated}
				onClientUpdated={onClientUpdated}
				onClientDeleted={onClientDeleted}
				onClientFetched={onClientFetched}
			/>
		);

		expect(screen.getByText('Buscar')).toBeDisabled();
		fireEvent.click(screen.getByText('Crear'));
		expect(screen.getByTestId('create-client-modal')).toBeInTheDocument();

		fireEvent.click(screen.getByText('submit-create-client'));
		await waitFor(() => {
			expect(onClientCreated).toHaveBeenCalledWith({ phone_number: '4491111111' });
		});

		fireEvent.change(screen.getByPlaceholderText('Ingresa solo números'), { target: { value: '4491234567' } });
		expect(screen.getByText('Buscar')).not.toBeDisabled();
		fireEvent.click(screen.getByText('Buscar'));

		await waitFor(() => {
			expect(screen.getByTestId('mock-update-client-modal')).toBeInTheDocument();
		});
		expect(screen.getByText('Marco Burgos')).toBeInTheDocument();

		fireEvent.click(screen.getByText('submit-update-client'));
		await waitFor(() => {
			expect(onClientUpdated).toHaveBeenCalledWith({ phone_number: '4491234567' });
		});

		fireEvent.click(screen.getByText('submit-delete-client'));
		await waitFor(() => {
			expect(onClientDeleted).toHaveBeenCalledTimes(2);
		});
		expect(onClientDeleted).toHaveBeenNthCalledWith(1, { phone_number: '4491234567' });
		expect(onClientDeleted).toHaveBeenNthCalledWith(2, { phone_number: '4491234567' });
	});

	test('shows the client not found state when search does not return a client', async () => {
		const onClientFetched = jest.fn().mockResolvedValue(null);

		renderInTheme(
			<Clients
				onClientCreated={jest.fn()}
				onClientUpdated={jest.fn()}
				onClientDeleted={jest.fn()}
				onClientFetched={onClientFetched}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Ingresa solo números'), { target: { value: '4490000000' } });
		fireEvent.click(screen.getByText('Buscar'));

		await waitFor(() => {
			expect(screen.getByText('Cliente no encontrado.')).toBeInTheDocument();
		});
	});

	test('updates and deletes a client in UpdateClientModal and hides admin controls for non-admin users', async () => {
		const onClose = jest.fn();
		const onUpdate = jest.fn().mockResolvedValue(undefined);
		const onDelete = jest.fn().mockResolvedValue(undefined);

		const firstView = renderInTheme(
			<ActualUpdateClientModal
				isOpen
				onClose={onClose}
				onUpdate={onUpdate}
				onDelete={onDelete}
				clientData={clientData}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Ingresa el teléfono del cliente'), { target: { value: '4497654321' } });
		expect(screen.getByText('Este cambio creará un nuevo registro con la información actual.')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Eliminar el registro antiguo'));
		fireEvent.change(screen.getByPlaceholderText('Ingresa la dirección primaria del cliente'), { target: { value: 'Av Vallarta 456' } });
		fireEvent.click(screen.getByText('Eliminar 2da dirección'));
		fireEvent.click(screen.getByText('Actualizar'));

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalledWith({
				phone_number: '4497654321',
				original_phone_number: '4491234567',
				name: 'Marco Burgos',
				address: 'Av Vallarta 456',
				address_geolocation: null,
				second_address: null,
				second_address_geolocation: null,
				email: 'marco@hiberry.mx',
				discount: '10',
				delete_old_record: false
			});
		});
		expect(onClose).toHaveBeenCalledTimes(1);

		firstView.unmount();

		const secondView = renderInTheme(
			<ActualUpdateClientModal
				isOpen
				onClose={onClose}
				onUpdate={onUpdate}
				onDelete={onDelete}
				clientData={clientData}
			/>
		);

		fireEvent.click(screen.getByText('Eliminar'));
		await waitFor(() => {
			expect(onDelete).toHaveBeenCalledWith({ phone_number: '4491234567' });
		});

		secondView.unmount();

		isAdmin.mockReturnValue(false);
		renderInTheme(
			<ActualUpdateClientModal
				isOpen
				onClose={onClose}
				onUpdate={onUpdate}
				onDelete={onDelete}
				clientData={clientData}
			/>
		);

		expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
		expect(screen.getByPlaceholderText('Ingresa la latitud de la dirección primaria')).toBeDisabled();
		expect(screen.getByPlaceholderText('Ingresa la longitud del cliente')).toBeDisabled();
		expect(screen.getByPlaceholderText('Ingresa la latitud de la dirección secundaria')).toBeDisabled();
		expect(screen.getByPlaceholderText('Ingresa la longitud de la dirección secundaria')).toBeDisabled();
	});

	test('renders product empty state, create flow, row update flow, and non-admin restrictions', async () => {
		const onProductCreated = jest.fn();
		const onProductUpdated = jest.fn();
		const onProductDeleted = jest.fn();
		const tableData = [{ id: 'prod-1', name: 'Mango Ataulfo', price: 180 }];

		const firstView = renderInTheme(
			<Products
				columnsData={productColumns}
				tableData={[]}
				onProductCreated={onProductCreated}
				onProductUpdated={onProductUpdated}
				onProductDeleted={onProductDeleted}
			/>
		);

		expect(screen.getByText('No hay registros para mostrar.')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Crear'));
		expect(screen.getByTestId('create-product-modal')).toBeInTheDocument();
		fireEvent.click(screen.getByText('submit-create-product'));
		expect(onProductCreated).toHaveBeenCalledWith({ item: { name: 'Nueva fruta', price: '80' } });

		firstView.unmount();

		const secondView = renderInTheme(
			<Products
				columnsData={productColumns}
				tableData={tableData}
				onProductCreated={onProductCreated}
				onProductUpdated={onProductUpdated}
				onProductDeleted={onProductDeleted}
			/>
		);

		expect(screen.getByText('Mango Ataulfo')).toBeInTheDocument();
		expect(screen.getByText('$180.00')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Mango Ataulfo'));

		await waitFor(() => {
			expect(screen.getByTestId('mock-update-product-modal')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('submit-update-product'));
		expect(onProductUpdated).toHaveBeenCalledWith({ item: tableData[0], rowIndex: 0 });

		fireEvent.click(screen.getByText('submit-delete-product'));
		expect(onProductDeleted).toHaveBeenCalledWith({ item: tableData[0], rowIndex: 0 });

		secondView.unmount();

		isAdmin.mockReturnValue(false);
		renderInTheme(
			<Products
				columnsData={productColumns}
				tableData={tableData}
				onProductCreated={onProductCreated}
				onProductUpdated={onProductUpdated}
				onProductDeleted={onProductDeleted}
			/>
		);

		expect(screen.queryByText('Crear')).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('Mango Ataulfo'));
		expect(screen.queryByTestId('mock-update-product-modal')).not.toBeInTheDocument();
	});
});