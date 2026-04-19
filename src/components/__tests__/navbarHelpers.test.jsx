import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@hypertheme-editor/chakra-ui', () => ({
	ThemeEditor: ({ children }) => <div data-testid='theme-editor-container'>{children}</div>,
	ThemeEditorDrawer: ({ children }) => <div data-testid='theme-editor-drawer'>{children}</div>,
	ThemeEditorColors: () => <div data-testid='theme-editor-colors' />,
	ThemeEditorFontSizes: () => <div data-testid='theme-editor-font-sizes' />
}));

jest.mock('@chakra-ui/react', () => ({
	...jest.requireActual('@chakra-ui/react'),
	useColorMode: jest.fn()
}));

import FixedPlugin from '../fixedPlugin/FixedPlugin';
import { ThemeEditor } from '../navbar/ThemeEditor';
import theme from 'theme/theme';

const renderInTheme = (ui) => {
	return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
};

describe('Navbar helper components', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('renders the fixed plugin button and toggles color mode in ltr', () => {
		const toggleColorMode = jest.fn();
		useColorMode.mockReturnValue({ colorMode: 'light', toggleColorMode });
		document.documentElement.dir = 'ltr';

		const { container } = renderInTheme(<FixedPlugin />);

		fireEvent.click(screen.getByRole('button'));

		expect(toggleColorMode).toHaveBeenCalledTimes(1);
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	test('renders the fixed plugin button for rtl dark mode and renders the theme editor trigger', () => {
		const onOpen = jest.fn();
		useColorMode.mockReturnValue({ colorMode: 'dark', toggleColorMode: jest.fn() });
		document.documentElement.dir = 'rtl';

		renderInTheme(
			<>
				<FixedPlugin />
				<ThemeEditor onOpen={onOpen} navbarIcon='brand.500' />
			</>
		);

		const buttons = screen.getAllByRole('button');
		fireEvent.click(buttons[1]);

		expect(onOpen).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId('theme-editor-container')).toBeInTheDocument();
		expect(screen.getByTestId('theme-editor-drawer')).toBeInTheDocument();
		document.documentElement.dir = 'ltr';
	});
});