import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider, useDisclosure } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@chakra-ui/react', () => ({
	...jest.requireActual('@chakra-ui/react'),
	useDisclosure: jest.fn(),
	Drawer: ({ isOpen, placement, children }) =>
		isOpen ? (
			<div data-testid='drawer' data-placement={placement}>
				{children}
			</div>
		) : null,
	DrawerOverlay: ({ children }) => <div data-testid='drawer-overlay'>{children}</div>,
	DrawerContent: ({ children }) => <div data-testid='drawer-content'>{children}</div>,
	DrawerBody: ({ children }) => <div data-testid='drawer-body'>{children}</div>,
	DrawerCloseButton: ({ onClose }) => (
		<button type='button' data-testid='drawer-close' onClick={onClose}>
			close
		</button>
	)
}));

jest.mock('react-custom-scrollbars-2', () => ({
	Scrollbars: ({ children }) => <div data-testid='mock-scrollbars'>{children}</div>
}));

jest.mock('components/sidebar/components/Content', () => ({ routes }) => (
	<div data-testid='sidebar-content'>{routes.length}</div>
));

import Sidebar, { SidebarResponsive } from '../Sidebar';
import theme from 'theme/theme';

const routes = [ { name: 'Dashboard', layout: '/admin', path: '/dashboard' } ];

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Sidebar', () => {
	test('renders the desktop sidebar inside custom scrollbars', () => {
		renderInTheme(<Sidebar routes={routes} />);

		expect(screen.getByTestId('mock-scrollbars')).toBeInTheDocument();
		expect(screen.getByTestId('sidebar-content')).toHaveTextContent('1');
	});

	test('renders the responsive drawer in rtl and ltr modes and wires open/close handlers', () => {
		const onOpen = jest.fn();
		const onClose = jest.fn();
		useDisclosure.mockReturnValue({ isOpen: true, onOpen, onClose });
		document.documentElement.dir = 'rtl';

		const { container, rerender } = renderInTheme(<SidebarResponsive routes={routes} />);

		fireEvent.click(container.querySelector('svg').parentElement);
		expect(onOpen).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('drawer')).toHaveAttribute('data-placement', 'right');
		expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
		fireEvent.click(screen.getByTestId('drawer-close'));
		expect(onClose).toHaveBeenCalledTimes(1);

		useDisclosure.mockReturnValue({ isOpen: true, onOpen, onClose });
		document.documentElement.dir = 'ltr';
		rerender(
			<ChakraProvider theme={theme}>
				<SidebarResponsive routes={routes} />
			</ChakraProvider>
		);

		expect(screen.getByTestId('drawer')).toHaveAttribute('data-placement', 'left');
	});
});