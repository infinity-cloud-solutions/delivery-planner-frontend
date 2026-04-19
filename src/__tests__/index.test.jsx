import React from 'react';
import '@testing-library/jest-dom';

jest.mock('@hypertheme-editor/chakra-ui', () => ({
	ThemeEditorProvider: ({ children }) => <div data-testid='theme-editor-provider'>{children}</div>
}));

jest.mock('@chakra-ui/react', () => ({
	...jest.requireActual('@chakra-ui/react'),
	ChakraProvider: ({ children }) => <div data-testid='chakra-provider'>{children}</div>
}));

jest.mock('react-router-dom', () => ({
	HashRouter: ({ children }) => <div data-testid='hash-router'>{children}</div>,
	Switch: ({ children }) => <div data-testid='switch'>{children}</div>,
	Route: ({ path, component: Component }) => (
		<div data-testid={`route-${path}`}>
			<Component />
		</div>
	),
	Redirect: ({ from, to }) => <div data-testid='redirect'>{`${from || ''}:${to}`}</div>
}));

jest.mock('layouts/auth', () => function AuthLayoutMock() {
	return <div data-testid='auth-layout' />;
});

jest.mock('layouts/admin', () => function AdminLayoutMock() {
	return <div data-testid='admin-layout' />;
});

jest.mock('layouts/driver', () => function DriverLayoutMock() {
	return <div data-testid='driver-layout' />;
});

jest.mock('layouts/auth/Protected', () => ({ component: Component, path }) => (
	<div data-testid='protected-route' data-path={path}>
		<Component />
	</div>
));

jest.mock('theme/theme', () => ({
	__esModule: true,
	default: { name: 'mock-theme' }
}));

describe('application bootstrap', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		document.body.innerHTML = '<div id="root"></div>';
	});

	test('renders the app shell into the root element', () => {
		let appElement;

		jest.isolateModules(() => {
			jest.doMock('react-dom', () => ({
				...jest.requireActual('react-dom'),
				render: jest.fn()
			}));

			const ReactDOM = require('react-dom');
			require('index');

			expect(ReactDOM.render).toHaveBeenCalled();
			expect(ReactDOM.render).toHaveBeenCalledWith(expect.any(Object), document.getElementById('root'));

			[ appElement ] = ReactDOM.render.mock.calls[0];
			jest.dontMock('react-dom');
		});

		expect(React.isValidElement(appElement)).toBe(true);
	});
});