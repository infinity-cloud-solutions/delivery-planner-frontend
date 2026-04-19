import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('components/icons/Icons', () => ({
	HorizonLogo: (props) => <svg data-testid='horizon-logo' {...props} />
}));

import SidebarContent from '../Content';
import SidebarLinks from '../Links';
import SidebarBrand from '../Brand';
import SidebarCard from '../SidebarCard';
import theme from 'theme/theme';

const routes = [
	{
		category: true,
		name: 'Core',
		items: [
			{
				name: 'Dashboard',
				layout: '/admin',
				path: '/dashboard',
				icon: <span>icon</span>
			}
		]
	},
	{
		name: 'Orders',
		layout: '/admin',
		path: '/orders'
	}
];

const renderWithRouter = (ui, route) => {
	const history = createMemoryHistory({ initialEntries: [ route ] });

	return render(
		<ChakraProvider theme={theme}>
			<Router history={history}>{ui}</Router>
		</ChakraProvider>
	);
};

describe('Sidebar pieces', () => {
	test('renders the sidebar brand and upgrade card', () => {
		renderWithRouter(
			<>
				<SidebarBrand />
				<SidebarCard />
			</>,
			'/admin/dashboard'
		);

		expect(screen.getByTestId('horizon-logo')).toBeInTheDocument();
		expect(screen.getAllByText('Upgrade to PRO')).toHaveLength(2);
		expect(screen.getByRole('link', { name: 'Upgrade to PRO' })).toHaveAttribute(
			'href',
			'https://horizon-ui.com/pro?ref=horizon-chakra-free'
		);
	});

	test('renders sidebar content and recursive links for icon and no-icon routes', () => {
		const firstRender = renderWithRouter(<SidebarContent routes={routes} />, '/admin/dashboard');

		expect(screen.getByText('Core')).toBeInTheDocument();
		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(screen.getByText('Orders')).toBeInTheDocument();

		firstRender.unmount();
		renderWithRouter(<SidebarLinks routes={routes} />, '/admin/orders');

		expect(screen.getByText('Dashboard')).toBeInTheDocument();
		expect(screen.getByText('Orders')).toBeInTheDocument();
	});
});