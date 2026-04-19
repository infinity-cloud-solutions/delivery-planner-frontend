import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen } from '@testing-library/react';

let mockAdminLinksProps;
let mockDriverLinksProps;

jest.mock('components/navbar/NavbarLinksAdmin', () => (props) => {
	mockAdminLinksProps = props;
	return <div data-testid='admin-navbar-links'>{String(props.scrolled)}</div>;
});

jest.mock('components/navbar/NavbarLinksDriver', () => (props) => {
	mockDriverLinksProps = props;
	return <div data-testid='driver-navbar-links'>{String(props.scrolled)}</div>;
});

import NavbarAdmin from '../NavbarAdmin';
import NavbarDriver from '../NavbarDriver';
import NavbarRTL from '../NavbarRTL';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Navbar shells', () => {
	test('wires the admin navbar scroll listener and forwards scrolled state', () => {
		const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
		const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });

		const { unmount } = renderInTheme(<NavbarAdmin brandText='Dashboard' logoText='HiBerry' />);

		expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
		expect(screen.getByTestId('admin-navbar-links')).toHaveTextContent('false');
		expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

		Object.defineProperty(window, 'scrollY', { value: 2, configurable: true });
		act(() => {
			window.dispatchEvent(new Event('scroll'));
		});
		expect(screen.getByTestId('admin-navbar-links')).toHaveTextContent('true');

		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
		act(() => {
			window.dispatchEvent(new Event('scroll'));
		});
		expect(screen.getByTestId('admin-navbar-links')).toHaveTextContent('false');

		unmount();
		expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
	});

	test('renders the driver navbar secondary message and the rtl navbar shell', () => {
		renderInTheme(
			<>
				<NavbarDriver brandText='Deliveries' logoText='HiBerry' secondary message='Driver ready' />
				<NavbarRTL brandText='RTL Dashboard' logoText='HiBerry' />
			</>
		);

		expect(screen.getAllByText('Deliveries').length).toBeGreaterThan(0);
		expect(screen.getByText('Driver ready')).toBeInTheDocument();
		expect(screen.getByTestId('driver-navbar-links')).toHaveTextContent('false');
		expect(screen.getAllByText('RTL Dashboard').length).toBeGreaterThan(0);
		expect(screen.getAllByTestId('admin-navbar-links').length).toBeGreaterThan(0);
	});

	test('wires driver and rtl scroll listeners and forwards updated scrolled state', () => {
		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
		const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
		let driverScrollHandler;
		let rtlScrollHandler;

		addEventListenerSpy.mockImplementation((type, handler) => {
			if (type === 'scroll' && !driverScrollHandler) {
				driverScrollHandler = handler;
				return;
			}

			if (type === 'scroll') {
				rtlScrollHandler = handler;
			}
		});

		const driverView = renderInTheme(<NavbarDriver brandText='Deliveries' logoText='HiBerry' />);

		expect(screen.getByTestId('driver-navbar-links')).toHaveTextContent('false');

		Object.defineProperty(window, 'scrollY', { value: 3, configurable: true });
		act(() => {
			driverScrollHandler();
		});

		expect(screen.getByTestId('driver-navbar-links')).toHaveTextContent('true');

		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
		act(() => {
			driverScrollHandler();
		});

		expect(screen.getByTestId('driver-navbar-links')).toHaveTextContent('false');
		driverView.unmount();

		const rtlView = renderInTheme(<NavbarRTL brandText='RTL Dashboard' logoText='HiBerry' />);
		expect(screen.getByTestId('admin-navbar-links')).toHaveTextContent('false');

		Object.defineProperty(window, 'scrollY', { value: 3, configurable: true });
		act(() => {
			rtlScrollHandler();
		});

		expect(screen.getByTestId('admin-navbar-links')).toHaveTextContent('true');

		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
		act(() => {
			rtlScrollHandler();
		});

		expect(screen.getByTestId('admin-navbar-links')).toHaveTextContent('false');
		rtlView.unmount();
		addEventListenerSpy.mockRestore();
	});
});