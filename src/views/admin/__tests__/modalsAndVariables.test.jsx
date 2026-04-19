import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConsolidatedModal from '../orders/components/ConsolidatedModal';
import CreateProductModal from '../products/components/CreateProductModal';
import { columnsOrdersDashboard } from '../dashboard/variables/columnsData';
import { columnsDataOrders } from '../orders/variables/columnsData';
import { tableColumnsProducts } from '../products/variables/tableColumnsProducts';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Admin helper modals and variable exports', () => {
	test('renders consolidated products and closes the modal', () => {
		const onClose = jest.fn();

		renderInTheme(
			<ConsolidatedModal
				isOpen
				onClose={onClose}
				products={{
					1: { Fresa: 2, Mango: 1 },
					2: { Piña: 3 }
				}}
			/>
		);

		expect(screen.getByText('Repartidor 1')).toBeInTheDocument();
		expect(screen.getByText('Fresa')).toBeInTheDocument();
		expect(screen.getByText('Piña')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Cerrar'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test('creates a product and resets the form', async () => {
		const onClose = jest.fn();
		const onCreate = jest.fn();

		renderInTheme(<CreateProductModal isOpen onClose={onClose} onCreate={onCreate} />);
		const nameInput = screen.getByPlaceholderText('Ingresa el nombre del producto');
		const priceInput = screen.getByPlaceholderText('Ingresa el precio del producto');

		fireEvent.change(nameInput, { target: { value: 'Blueberries' } });
		fireEvent.change(priceInput, { target: { value: '199' } });
		fireEvent.click(screen.getByRole('button', { name: 'Crear Producto' }));

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledWith({ name: 'Blueberries', price: '199' });
		});
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(nameInput).toHaveValue('');
		expect(priceInput).toHaveValue(null);
	});

	test('exports the expected admin table column definitions', () => {
		expect(columnsOrdersDashboard).toEqual([
			{ Header: 'NOMBRE', accessor: 'name_display' },
			{ Header: 'STATUS', accessor: 'status' },
			{ Header: 'MONTO TOTAL', accessor: 'total_amount' },
			{ Header: 'MÉTODO DE PAGO', accessor: 'payment_method' }
		]);

		expect(columnsDataOrders[0]).toEqual({ Header: 'FECHA', accessor: 'delivery_date' });
		expect(columnsDataOrders[columnsDataOrders.length - 1]).toEqual({ Header: 'STATUS', accessor: 'status' });
		expect(columnsDataOrders).toHaveLength(12);

		expect(tableColumnsProducts).toEqual([
			{ Header: 'Nombre', accessor: 'name' },
			{ Header: 'Precio', accessor: 'price' }
		]);
	});
});