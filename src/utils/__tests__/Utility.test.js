import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Route, Router } from 'react-router-dom';

import { getDateAsQueryParam, useQueryParam } from '../Utility';

function QueryParamProbe({ paramName }) {
	const value = useQueryParam(paramName);

	return <div data-testid='query-value'>{String(value)}</div>;
}

describe('Utility helpers', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	test('reads a query parameter from the current route location', () => {
		const history = createMemoryHistory({
			initialEntries: [ '/orders?date=2026-04-18&driver=2' ]
		});

		render(
			<Router history={history}>
				<Route path='/orders'>
					<QueryParamProbe paramName='date' />
				</Route>
			</Router>
		);

		expect(screen.getByTestId('query-value')).toHaveTextContent('2026-04-18');
	});

	test('returns null when the requested query parameter is not present', () => {
		const history = createMemoryHistory({
			initialEntries: [ '/orders?date=2026-04-18' ]
		});

		render(
			<Router history={history}>
				<Route path='/orders'>
					<QueryParamProbe paramName='driver' />
				</Route>
			</Router>
		);

		expect(screen.getByTestId('query-value')).toHaveTextContent('null');
	});

	test('formats the current date as an ISO query parameter string', () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-04-18T14:30:00Z'));

		expect(getDateAsQueryParam()).toBe('2026-04-18');
	});
});