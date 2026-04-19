import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useHistory } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn()
}));

jest.mock('components/sidebar/Sidebar', () => ({
	SidebarResponsive: () => <div data-testid='sidebar-responsive' />
}));

jest.mock('routes.js', () => []);

jest.mock('driverRoutes.js', () => []);

jest.mock('../ThemeEditor', () => ({
	ThemeEditor: () => <div data-testid='theme-editor-helper' />
}));

jest.mock('security.js', () => ({
	getFullNameFromLocalStorage: jest.fn(),
	logout: jest.fn()
}));

import NavbarLinksAdmin from '../NavbarLinksAdmin';
import NavbarLinksDriver from '../NavbarLinksDriver';
import { getFullNameFromLocalStorage, logout } from 'security.js';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Navbar user link menus', () => {
	test('opens the admin user menu and logs out to auth', async () => {
		const push = jest.fn();
		useHistory.mockReturnValue({ push });
		getFullNameFromLocalStorage.mockReturnValue('Marco Burgos');

		renderInTheme(<NavbarLinksAdmin />);

		expect(screen.getByTestId('sidebar-responsive')).toBeInTheDocument();
		expect(screen.getByTestId('theme-editor-helper')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button'));
		expect(await screen.findByText(/Hola, Marco Burgos/)).toBeInTheDocument();

		fireEvent.click(screen.getByText('Cerrar sesión'));
		expect(logout).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith('/auth');
	});

	test('opens the driver user menu and logs out to auth', async () => {
		const push = jest.fn();
		useHistory.mockReturnValue({ push });
		getFullNameFromLocalStorage.mockReturnValue('Marco Burgos');

		renderInTheme(<NavbarLinksDriver secondary />);

		fireEvent.click(screen.getByRole('button'));
		expect(await screen.findByText(/Hola, Marco/)).toBeInTheDocument();

		fireEvent.click(screen.getByText('Cerrar sesión'));
		expect(logout).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith('/auth');
	});
});