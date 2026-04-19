import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

export const renderWithProviders = (ui, { route = '/' } = {}) => {
	const history = createMemoryHistory({ initialEntries: [ route ] });

	return {
		history,
		...render(
			<ChakraProvider>
				<Router history={history}>{ui}</Router>
			</ChakraProvider>
		)
	};
};

export const createDeferred = () => {
	let resolve;
	let reject;

	const promise = new Promise((promiseResolve, promiseReject) => {
		resolve = promiseResolve;
		reject = promiseReject;
	});

	return { promise, resolve, reject };
};