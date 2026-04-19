import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('date-fns', () => ({
	addDays: (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
	format: (date, pattern) => {
		if (pattern === "d 'de' MMMM") {
			const months = [
				'enero',
				'febrero',
				'marzo',
				'abril',
				'mayo',
				'junio',
				'julio',
				'agosto',
				'septiembre',
				'octubre',
				'noviembre',
				'diciembre'
			];

			return `${date.getUTCDate()} de ${months[date.getUTCMonth()]}`;
		}

		if (pattern === 'yyyy-MM-dd') {
			return date.toISOString().slice(0, 10);
		}

		return '';
	}
}));

jest.mock('date-fns/locale/es', () => ({}));

import MainMenu from '../MainMenu';
import theme from 'theme/theme';

const renderMainMenu = (onDateSelect) => {
	const history = createMemoryHistory({ initialEntries: [ '/admin/orders' ] });

	return {
		history,
		...render(
			<ChakraProvider theme={theme}>
				<Router history={history}>
					<MainMenu onDateSelect={onDateSelect} />
				</Router>
			</ChakraProvider>
		)
	};
};

describe('MainMenu', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	test('generates seven date options and navigates when a date is selected', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-04-18T12:00:00Z'));
		const onDateSelect = jest.fn();
		const { history } = renderMainMenu(onDateSelect);

		fireEvent.click(screen.getByRole('button'));

		const items = screen.getAllByRole('menuitem', { hidden: true });
		expect(items).toHaveLength(7);

		fireEvent.click(items[0]);

		expect(onDateSelect).toHaveBeenCalledWith(expect.objectContaining({ value: '2026-04-18' }));
		expect(history.location.pathname).toBe('/admin/orders');
		expect(history.location.search).toBe('?date=2026-04-18');
	});
});