import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('react-calendar', () => {
	const React = require('react');

	return function MockCalendar(props) {
		return (
			<div data-testid='react-calendar'>
				<div>{props.formatMonthYear('es', new Date('2026-04-18T00:00:00Z'))}</div>
				<div>{props.formatShortWeekday('es', new Date('2026-04-18T00:00:00Z'))}</div>
				<div>{String(props.selectRange)}</div>
				<button type='button' onClick={() => props.onChange(new Date('2026-04-19T00:00:00Z'))}>
					change calendar date
				</button>
			</div>
		);
	};
});

jest.mock('react-apexcharts', () => {
	const React = require('react');

	return function MockApexCharts(props) {
		return <div data-testid={`apex-${props.type}`}>{JSON.stringify(props)}</div>;
	};
});

import BarChart from '../charts/BarChart';
import LineAreaChart from '../charts/LineAreaChart';
import LineChart from '../charts/LineChart';
import MiniCalendar from '../calendar/MiniCalendar';
import PieChart from '../charts/PieChart';
import ScrollToTop from '../scroll/ScrollToTop';
import { renderThumb, renderTrack, renderView } from '../scrollbar/Scrollbar';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Calendar, chart, and scroll helpers', () => {
	test('renders the mini calendar with capitalized month and weekday labels', () => {
		renderInTheme(<MiniCalendar selectRange />);

		expect(screen.getByText(/Abril/)).toBeInTheDocument();
		expect(
			screen.getByText((_, element) => element?.textContent === 'S' || element?.textContent === 'V')
		).toBeInTheDocument();
		expect(screen.getByText('true')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'change calendar date' }));
		expect(screen.getByTestId('react-calendar')).toBeInTheDocument();
	});

	test('passes props through each ApexCharts wrapper after componentDidMount', async () => {
		renderInTheme(
			<>
				<BarChart chartData={[ { name: 'Orders', data: [ 1, 2 ] } ]} chartOptions={{ xaxis: { categories: [ 'A', 'B' ] } }} />
				<LineAreaChart chartData={[ { name: 'Revenue', data: [ 3, 4 ] } ]} chartOptions={{ colors: [ '#000' ] }} />
				<LineChart chartData={[ { name: 'Profit', data: [ 5, 6 ] } ]} chartOptions={{ stroke: { curve: 'smooth' } }} />
				<PieChart chartData={[ 10, 20, 30 ]} chartOptions={{ labels: [ 'A', 'B', 'C' ] }} />
			</>
		);

		await waitFor(() => {
			expect(screen.getByTestId('apex-bar')).toHaveTextContent('Orders');
			expect(screen.getByTestId('apex-area')).toHaveTextContent('Revenue');
			expect(screen.getByTestId('apex-line')).toHaveTextContent('Profit');
			expect(screen.getByTestId('apex-pie')).toHaveTextContent('10');
		});
		expect(screen.getByTestId('apex-pie')).toHaveTextContent('"height":"55%"');
	});

	test('scrolls to the top when the route changes outside of templates pages', () => {
		const history = createMemoryHistory({ initialEntries: [ '/admin/dashboard' ] });
		const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

		window.history.pushState({}, '', '/admin/dashboard');

		render(
			<Router history={history}>
				<ScrollToTop>
					<div>content</div>
				</ScrollToTop>
			</Router>
		);

		act(() => {
			history.push('/admin/orders');
		});

		expect(scrollSpy).toHaveBeenCalledWith(0, 0);
	});

	test('does not register scroll-to-top behavior for template urls', () => {
		const history = createMemoryHistory({ initialEntries: [ '/admin/dashboard' ] });
		const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

		window.history.pushState({}, '', '/templates/example');

		render(
			<Router history={history}>
				<ScrollToTop>
					<div>content</div>
				</ScrollToTop>
			</Router>
		);

		act(() => {
			history.push('/admin/clients');
		});

		expect(scrollSpy).not.toHaveBeenCalled();
		window.history.pushState({}, '', '/');
	});

	test('merges the expected styles for custom scrollbar helpers', () => {
		const { container } = render(
			<>
				{renderTrack({ style: { opacity: 1 }, 'data-testid': 'scroll-track' })}
				{renderThumb({ style: { background: 'red' }, 'data-testid': 'scroll-thumb' })}
			</>
		);
		renderInTheme(renderView({ style: { marginTop: '5px' }, 'data-testid': 'scroll-view' }));

		expect(screen.getByTestId('scroll-track')).toHaveStyle({ width: '6px', opacity: '0' });
		expect(screen.getByTestId('scroll-thumb')).toHaveStyle({ borderRadius: '15px' });
		expect(screen.getByTestId('scroll-view')).toHaveStyle({ marginBottom: '-22px', marginTop: '5px' });
		expect(container).toBeInTheDocument();
	});
});