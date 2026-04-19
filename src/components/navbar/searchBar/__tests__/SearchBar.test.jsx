import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { SearchBar } from '../SearchBar';
import theme from 'theme/theme';

describe('SearchBar', () => {
	test('renders custom and default search input props', () => {
		const { rerender } = render(
			<ChakraProvider theme={theme}>
				<SearchBar placeholder='Find deliveries' borderRadius='12px' background='pink.100' />
			</ChakraProvider>
		);

		expect(screen.getByPlaceholderText('Find deliveries')).toBeInTheDocument();
		expect(screen.getByRole('button')).toBeInTheDocument();

		rerender(
			<ChakraProvider theme={theme}>
				<SearchBar />
			</ChakraProvider>
		);

		expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
	});
});