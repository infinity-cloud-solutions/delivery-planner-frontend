import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SetNewPasswordModal from '../components/SetNewPasswordModal';
import theme from 'theme/theme';

const renderModal = (props = {}) => {
	const defaultProps = {
		isOpen: true,
		onClose: jest.fn(),
		onSubmit: jest.fn(),
		...props
	};

	const view = render(
		<ChakraProvider theme={theme}>
			<SetNewPasswordModal {...defaultProps} />
		</ChakraProvider>
	);

	return {
		...view,
		props: defaultProps
	};
};

describe('SetNewPasswordModal', () => {
	test('toggles password visibility and validates short passwords and mismatched confirmation', async () => {
		const { container } = renderModal();
		const inputs = document.body.querySelectorAll('input');

		expect(inputs[0]).toHaveAttribute('type', 'password');
		expect(inputs[1]).toHaveAttribute('type', 'password');

		fireEvent.click(document.body.querySelectorAll('svg')[1]);
		expect(inputs[0]).toHaveAttribute('type', 'text');
		expect(inputs[1]).toHaveAttribute('type', 'text');

		fireEvent.change(inputs[0], { target: { value: 'short' } });
		fireEvent.change(inputs[1], { target: { value: 'short' } });
		fireEvent.click(screen.getByText('Guardar'));
		expect(screen.getByText('Contraseña debe ser al menos 8 caracteres')).toBeInTheDocument();

		fireEvent.change(inputs[0], { target: { value: 'password123' } });
		fireEvent.change(inputs[1], { target: { value: 'password456' } });
		fireEvent.click(screen.getByText('Guardar'));
		expect(screen.getByText('Los campos deben coincidir')).toBeInTheDocument();
	});

	test('submits a valid password, resets the form, and closes the modal', async () => {
		const { props } = renderModal();
		const inputs = document.body.querySelectorAll('input');

		fireEvent.change(inputs[0], { target: { value: 'password123' } });
		fireEvent.change(inputs[1], { target: { value: 'password123' } });
		fireEvent.click(screen.getByText('Guardar'));

		await waitFor(() => {
			expect(props.onSubmit).toHaveBeenCalledWith('password123');
		});
		expect(props.onClose).toHaveBeenCalledTimes(1);
		expect(inputs[0]).toHaveValue('');
		expect(inputs[1]).toHaveValue('');
	});
});