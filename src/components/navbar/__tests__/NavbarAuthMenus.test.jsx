import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('@chakra-ui/react', () => ({
	...jest.requireActual('@chakra-ui/react'),
	useDisclosure: () => ({ isOpen: true, onOpen: jest.fn(), onClose: jest.fn() }),
	useColorMode: () => ({ colorMode: 'light' })
}));

jest.mock('components/sidebar/Sidebar', () => ({
	SidebarResponsive: () => <div data-testid='sidebar-responsive' />
}));

jest.mock('components/icons/Icons', () => ({
	HorizonLogo: (props) => <svg data-testid='horizon-logo' {...props} />
}));

jest.mock('routes.js', () => {
	const React = require('react');
	const leaf = (name, path, layout = '/auth') => ({
		name,
		layout,
		path,
		component: () => React.createElement('div', null, `${name}-page`)
	});

	const authItems = [
		{
			name: 'Auth Group',
			authIcon: React.createElement('span', null, 'auth-group-icon'),
			collapse: true,
			items: [ leaf('Sign In', '/login'), leaf('Reset Password', '/reset') ]
		},
		leaf('Direct Auth', '/direct')
	];

	return [
		{ name: 'Authentication', items: authItems },
		{
			name: 'Main Pages',
			items: [
				{
					name: 'Main Group',
					icon: React.createElement('span', null, 'main-group-icon'),
					collapse: true,
					items: [ leaf('Kanban', '/kanban', '/admin') ]
				},
				leaf('Main Leaf', '/main-leaf', '/admin')
			]
		},
		{ name: 'Dashboards', items: [ leaf('Dashboard Alpha', '/dash-alpha', '/admin') ] },
		{ name: 'NFTs', items: [ leaf('NFT Market', '/nft-market', '/admin') ] },
		{ name: 'Pricing Page', items: [] },
		{ name: 'Section With Icon', authIcon: React.createElement('span', null, 'section-icon'), items: [ leaf('Inner Auth Page', '/inner') ] },
		{ name: 'Plain Parent', items: [ leaf('Plain Child', '/plain') ] },
		{ name: 'RTL', items: [] },
		{ name: 'Widgets', items: [] },
		{ name: 'Charts', items: [] },
		{ name: 'Alerts', items: [] },
		{
			name: 'Container',
			items: [
				{ name: 'Authentication', items: authItems },
				{
					name: 'Applications',
					items: [
						{
							name: 'Calendar',
							authIcon: React.createElement('span', null, 'calendar-icon'),
							layout: '/admin',
							path: '/calendar'
						}
					]
				},
				{
					name: 'Ecommerce',
					items: [
						{
							name: 'Store Section',
							authIcon: React.createElement('span', null, 'store-icon'),
							items: [ leaf('Catalog', '/catalog', '/admin') ]
						},
						leaf('Standalone Product', '/standalone-product', '/admin'),
						{ name: 'Nested Commerce', items: [ leaf('Nested Commerce Child', '/nested-commerce-child', '/admin') ] }
					]
				},
				{
					name: 'Pages',
					items: [ leaf('FAQ', '/faq'), { name: 'Widgets', collapse: true, items: [ leaf('Widget Child', '/widget-child') ] } ]
				}
			]
		}
	];
});

import NavbarAuth from '../NavbarAuth';
import NavbarExample from '../NavbarExample';
import theme from 'theme/theme';

const renderInRouter = (ui) => {
	const history = createMemoryHistory({ initialEntries: [ '/' ] });

	return render(
		<ChakraProvider theme={theme}>
			<Router history={history}>{ui}</Router>
		</ChakraProvider>
	);
};

describe('Marketing navbars', () => {
	test('renders NavbarAuth menu sections and its secondary brand variant', () => {
		const view = renderInRouter(<NavbarAuth logoText='HiBerry' />);

		expect(screen.getByText('HiBerry')).toBeInTheDocument();
		expect(screen.getByText('Dashboards')).toBeInTheDocument();
		expect(screen.getByText('Authentications')).toBeInTheDocument();
		expect(screen.getByText('Main Pages')).toBeInTheDocument();
		expect(screen.getByText('NFTs')).toBeInTheDocument();
		expect(screen.getByText('Buy Now')).toBeInTheDocument();
		expect(screen.getByTestId('sidebar-responsive')).toBeInTheDocument();
		view.unmount();

		renderInRouter(<NavbarAuth logoText='HiBerry' secondary />);
		expect(screen.queryByText('HiBerry')).not.toBeInTheDocument();
		expect(screen.getByTestId('horizon-logo')).toBeInTheDocument();
	});

	test('renders NavbarExample dashboard, authentication, main page, and nft menus', () => {
		const view = renderInRouter(<NavbarExample logoText='HiBerry' />);

		expect(screen.getByText('HiBerry')).toBeInTheDocument();
		expect(screen.getByText('Pages')).toBeInTheDocument();
		expect(screen.getByText('Application')).toBeInTheDocument();
		expect(screen.getByText('Ecommerce')).toBeInTheDocument();
		expect(screen.getByText('Buy Now')).toBeInTheDocument();
		view.unmount();

		renderInRouter(<NavbarExample logoText='HiBerry' secondary />);
		expect(screen.getByText('HiBerry')).toBeInTheDocument();
		expect(screen.getByText('Pages')).toBeInTheDocument();
	});
});