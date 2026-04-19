import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

var mockInvalidateSize;
var mockMergeOptions;

jest.mock('leaflet', () => {
	mockMergeOptions = jest.fn();
	const Default = {
		prototype: {},
		mergeOptions: mockMergeOptions
	};
	const leafletApi = {
		Icon: { Default },
		icon: jest.fn((options) => options),
		divIcon: jest.fn((options) => options)
	};

	return {
		__esModule: true,
		default: leafletApi,
		...leafletApi
	};
});

jest.mock('react-leaflet', () => {
	const React = require('react');
	mockInvalidateSize = jest.fn();

	return {
		MapContainer: ({ children, whenCreated }) => {
			React.useEffect(() => {
				whenCreated?.({ invalidateSize: mockInvalidateSize });
			}, [whenCreated]);

			return <div data-testid='map-container'>{children}</div>;
		},
		TileLayer: () => <div data-testid='tile-layer' />,
		Marker: ({ position }) => <div data-testid='marker'>{position.join(',')}</div>,
		Polyline: ({ positions }) => <div data-testid='polyline'>{JSON.stringify(positions)}</div>
	};
});

jest.mock('react-beautiful-dnd', () => ({
	DragDropContext: ({ children, onDragEnd }) => (
		<div>
			<button
				type='button'
				data-testid='trigger-drag'
				onClick={() => onDragEnd({ source: { index: 0 }, destination: { index: 1 } })}
			>
				trigger-drag
			</button>
			{children}
		</div>
	),
	Droppable: ({ children, droppableId }) => children({
		droppableProps: { 'data-droppable-id': droppableId },
		innerRef: jest.fn(),
		placeholder: <tr data-testid='dnd-placeholder' />
	}),
	Draggable: ({ children, draggableId }) => children({
		draggableProps: { 'data-draggable-id': draggableId },
		dragHandleProps: {},
		innerRef: jest.fn()
	}, { isDragging: false })
}));

import MapModal from '../components/MapModal';
import theme from 'theme/theme';

const renderInTheme = (ui) => render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);

describe('MapModal', () => {
	beforeEach(() => {
		mockInvalidateSize.mockClear();
		mockMergeOptions.mockClear();
	});

	test('filters orders, reorders the selected route, and confirms the final route payload', async () => {
		const onClose = jest.fn();
		const onConfirmRoute = jest.fn().mockResolvedValue(undefined);
		const orders = [
			{
				id: 1,
				delivery_date: '2024-10-10',
				delivery_time: '9 AM - 1 PM',
				driver: 1,
				delivery_sequence: 2,
				delivery_address: 'Segunda parada',
				latitude: 20.72,
				longitude: -103.38
			},
			{
				id: 2,
				delivery_date: '2024-10-10',
				delivery_time: '9 AM - 1 PM',
				driver: 1,
				delivery_sequence: 1,
				delivery_address: 'Primera parada',
				latitude: 20.71,
				longitude: -103.37
			},
			{
				id: 3,
				delivery_date: '2024-10-10',
				delivery_time: '1 PM - 5 PM',
				driver: 2,
				delivery_sequence: 4,
				delivery_address: 'Otro repartidor',
				latitude: 20.75,
				longitude: -103.4
			}
		];

		renderInTheme(<MapModal isOpen onClose={onClose} onConfirmRoute={onConfirmRoute} orders={orders} />);

		expect(mockMergeOptions).toHaveBeenCalled();

		const selects = document.querySelectorAll('select');
		fireEvent.change(selects[0], { target: { value: '1' } });
		fireEvent.change(selects[1], { target: { value: '9 AM - 1 PM' } });

		await waitFor(() => {
			expect(screen.getByText('Primera parada')).toBeInTheDocument();
			expect(screen.getByText('Segunda parada')).toBeInTheDocument();
		});

		const table = screen.getByRole('table');
		expect(within(table).getByText('Primera parada')).toBeInTheDocument();
		expect(within(table).getByText('Segunda parada')).toBeInTheDocument();

		fireEvent.click(screen.getByTestId('trigger-drag'));
		fireEvent.click(screen.getByText('Confirmar y mandar a ruta'));

		await waitFor(() => {
			expect(screen.getByText('Confirmar Acción')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Confirmar'));

		await waitFor(() => {
			expect(onConfirmRoute).toHaveBeenCalledWith([
				{ id: 1, delivery_date: '2024-10-10', status: 'Programada', driver: 1, delivery_sequence: 1 },
				{ id: 2, delivery_date: '2024-10-10', status: 'Programada', driver: 1, delivery_sequence: 2 },
				{ id: 3, delivery_date: '2024-10-10', status: 'Programada', driver: 2, delivery_sequence: 4 }
			]);
		});
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});