import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider, useBreakpointValue } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@chakra-ui/react', () => ({
	...jest.requireActual('@chakra-ui/react'),
	useBreakpointValue: jest.fn()
}));

jest.mock('../deliveries/components/ConsolidatedModalDeliver', () => ({ isOpen, onClose, products }) =>
	isOpen ? (
		<div data-testid='mock-consolidated-delivery-modal'>
			<span>{Object.keys(products).join(',')}</span>
			<button type='button' onClick={onClose}>
				close mocked consolidated
			</button>
		</div>
	) : null
);

const ActualConsolidatedModalDeliver = jest.requireActual('../deliveries/components/ConsolidatedModalDeliver').default;
import DeliveryCard from '../deliveries/components/Delivery';
import RouteStop from '../deliveries/components/RouteStop';
import theme from 'theme/theme';

const baseOrder = {
	id: 17,
	client_name: 'Marco Burgos',
	delivery_address: 'Av Juárez 123, Hidalgo',
	delivery_date: '2026-04-18',
	delivery_time: '10:00 - 12:00',
	phone_number: '4490001111',
	total_amount: '450.5',
	cart_items: [
		{ product: 'Mix Berries', quantity: 1, price: 150 },
		{ product: 'Mango', quantity: 2, price: 150 }
	],
	payment_method: 'Tarjeta',
	status: 'Programada',
	order: 'Ver detalles',
	cooler: 2,
	created_at: '2026-04-17T10:00:00.000Z',
	created_by: 'admin@hiberry.mx',
	delivery_sequence: 5,
	driver: 1,
	errors: [],
	latitude: 21.88,
	longitude: -102.29,
	notes: 'Llamar al llegar',
	discount: 0
};

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

const renderDelivery = (orderOverrides = {}, propsOverrides = {}) => {
	const onUpdateDelivery = jest.fn().mockResolvedValue(undefined);

	const view = renderInTheme(
		<DeliveryCard
			order={{ ...baseOrder, ...orderOverrides }}
			onUpdateDelivery={onUpdateDelivery}
			listOfConsolidatedProducts={{ 1: { Fresa: 2 } }}
			{...propsOverrides}
		/>
	);

	return {
		...view,
		onUpdateDelivery
	};
};

describe('Driver delivery components', () => {
	beforeEach(() => {
		useBreakpointValue.mockReturnValue('sm');
		jest.spyOn(window, 'open').mockImplementation(() => null);
	});

	afterEach(() => {
		window.open.mockRestore();
	});

	test('renders the consolidated delivery modal and the initial route stop card', () => {
		const onClose = jest.fn();

		renderInTheme(
			<>
				<ActualConsolidatedModalDeliver isOpen onClose={onClose} products={{ 1: { Fresa: 2 }, 2: { Mango: 1 } }} />
				<RouteStop />
			</>
		);

		expect(screen.getByText('Repartidor 1')).toBeInTheDocument();
		expect(screen.getAllByText('Mango').length).toBeGreaterThan(0);
		fireEvent.click(screen.getByText('Cerrar'));
		expect(onClose).toHaveBeenCalledTimes(1);

		expect(screen.getByText('Entregar a: Marco Burgos')).toBeInTheDocument();
		expect(screen.getByText('Efectivo')).toBeInTheDocument();
		expect(screen.getByText('Entregado')).toBeInTheDocument();
	});

	test('opens google maps, shows notes, opens consolidated modal, and adds a programmed order to the route', async () => {
		const { onUpdateDelivery } = renderDelivery();

		expect(screen.getByText('Llamar al llegar')).toBeInTheDocument();
		const addButton = screen.getByText('Agregar a ruta');
		expect(screen.getByRole('combobox')).toHaveValue('2');

		fireEvent.click(screen.getByText('Ver en Google Maps'));
		expect(window.open).toHaveBeenCalledWith(
			'https://www.google.com/maps/search/?api=1&query=Av%20Ju%C3%A1rez%20123%2C%20Hidalgo',
			'_blank'
		);

		fireEvent.click(screen.getByText('Ver consolidado'));
		expect(screen.getByTestId('mock-consolidated-delivery-modal')).toBeInTheDocument();
		fireEvent.click(screen.getByText('close mocked consolidated'));
		expect(screen.queryByTestId('mock-consolidated-delivery-modal')).not.toBeInTheDocument();

		fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });
		expect(screen.getByText('Agregar a ruta')).not.toBeDisabled();
		fireEvent.click(screen.getByText('Agregar a ruta'));

		await waitFor(() => {
			expect(onUpdateDelivery).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'En ruta',
					cooler: 3,
					total_amount: 450.5,
					delivery_sequence: 5,
					driver: 1
				}),
				17,
				'En ruta'
			);
		});
	});

	test('completes and reschedules in-route deliveries', async () => {
		const { onUpdateDelivery, rerender } = renderDelivery({
			status: 'En ruta',
			payment_method: 'Transferencia',
			notes: ''
		});

		expect(screen.getByText(/Orden en hielera: 2/)).toBeInTheDocument();
		fireEvent.click(screen.getByText('Entregada'));
		expect(screen.getByText('¿Estás seguro de que deseas marcar la orden como "Entregada"?')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Confirmar'));

		await waitFor(() => {
			expect(onUpdateDelivery).toHaveBeenCalledWith(expect.objectContaining({ status: 'Entregada' }), 17, 'Entregada');
		});

		rerender(
			<ChakraProvider theme={theme}>
				<DeliveryCard
					order={{ ...baseOrder, status: 'En ruta', payment_method: 'Pagada', notes: '', cooler: 2 }}
					onUpdateDelivery={onUpdateDelivery}
					listOfConsolidatedProducts={{ 1: { Fresa: 2 } }}
				/>
			</ChakraProvider>
		);

		fireEvent.click(screen.getAllByText('Reprogramar')[0]);
		fireEvent.change(screen.getByPlaceholderText('Motivo de la reprogramación'), { target: { value: 'Cliente solicitó otra fecha' } });
		fireEvent.click(screen.getAllByText('Reprogramar')[1]);

		await waitFor(() => {
			expect(onUpdateDelivery).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'Reprogramada', notes: 'Cliente solicitó otra fecha' }),
				17,
				'Reprogramada'
			);
		});
	});

	test.each([ 'Efectivo', 'Tarjeta', 'Transferencia', 'Pagada', 'Otro' ])(
		'renders the payment tag for %s',
		(paymentMethod) => {
			renderDelivery({ payment_method: paymentMethod, status: 'En ruta', notes: '' });
			expect(screen.getByText(paymentMethod)).toBeInTheDocument();
		}
	);
});