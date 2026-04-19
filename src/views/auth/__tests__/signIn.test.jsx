import React from 'react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import SignIn from '../signIn';
import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserPool
} from 'amazon-cognito-identity-js';
import { getAccessToken, isDriver, validateJWT } from 'security.js';

jest.mock('security.js', () => ({
	getAccessToken: jest.fn(),
	isDriver: jest.fn(),
	validateJWT: jest.fn()
}));

jest.mock('layouts/auth/Default', () => ({ children }) => (
	<div data-testid='default-auth-layout'>{children}</div>
));

jest.mock('views/auth/components/SetNewPasswordModal', () => ({ isOpen, onClose, onSubmit }) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div data-testid='new-password-modal'>
			<button type='button' onClick={() => onSubmit('UpdatedPass1!')}>
				submit new password
			</button>
			<button type='button' onClick={onClose}>
				close modal
			</button>
		</div>
	);
});

jest.mock('amazon-cognito-identity-js', () => ({
	AuthenticationDetails: jest.fn(),
	CognitoUser: jest.fn(),
	CognitoUserPool: jest.fn()
}));

const renderSignIn = (route = '/auth/sign-in') => {
	const history = createMemoryHistory({ initialEntries: [ route ] });

	return {
		history,
		...render(
			<ChakraProvider>
				<Router history={history}>
					<SignIn />
				</Router>
			</ChakraProvider>
		)
	};
};

const buildSession = ({
	accessToken = 'access-token',
	idToken = 'id-token',
	refreshToken = 'refresh-token'
} = {}) => ({
	getAccessToken: () => ({
		getJwtToken: () => accessToken
	}),
	getIdToken: () => ({
		getJwtToken: () => idToken
	}),
	getRefreshToken: () => ({
		getToken: () => refreshToken
	})
});

const getPasswordInput = (container) => container.querySelectorAll('input')[1];

const fillCredentials = (container, credentials = {}) => {
	const { email = 'admin@example.com', password = 'Secret123!' } = credentials;

	fireEvent.change(screen.getByPlaceholderText('email@ejemplo.com'), {
		target: { value: email }
	});
	fireEvent.change(getPasswordInput(container), {
		target: { value: password }
	});
};

describe('Auth sign-in view', () => {
	let authenticateUserMock;
	let completeNewPasswordChallengeMock;

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();

		process.env.REACT_APP_COGNITO_USER_POOL_ID = 'pool-id';
		process.env.REACT_APP_COGNITO_CLIENT_ID = 'client-id';

		getAccessToken.mockReturnValue(null);
		validateJWT.mockReturnValue(true);
		isDriver.mockReturnValue(false);

		authenticateUserMock = jest.fn();
		completeNewPasswordChallengeMock = jest.fn();

		CognitoUserPool.mockImplementation((poolData) => ({
			poolData,
			kind: 'user-pool'
		}));
		AuthenticationDetails.mockImplementation((authenticationData) => ({
			authenticationData,
			kind: 'authentication-details'
		}));
		CognitoUser.mockImplementation((userData) => ({
			userData,
			authenticateUser: authenticateUserMock,
			completeNewPasswordChallenge: completeNewPasswordChallengeMock
		}));

		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('redirects authenticated admins away from the sign-in view on mount', async () => {
		getAccessToken.mockReturnValue('stored-token');
		validateJWT.mockReturnValue(true);
		isDriver.mockReturnValue(false);

		const { history } = renderSignIn();

		await waitFor(() => {
			expect(history.location.pathname).toBe('/admin/dashboard');
		});
	});

	test('redirects authenticated drivers away from the sign-in view on mount', async () => {
		getAccessToken.mockReturnValue('stored-token');
		validateJWT.mockReturnValue(true);
		isDriver.mockReturnValue(true);

		const { history } = renderSignIn();

		await waitFor(() => {
			expect(history.location.pathname).toBe('/driver/deliveries');
		});
	});

	test('shows an auth error when a stored token is invalid', async () => {
		getAccessToken.mockReturnValue('stored-token');
		validateJWT.mockReturnValue(false);

		const { history } = renderSignIn();

		expect(await screen.findByText('No estás autenticado. Inicia sesión para entrar al sistema')).toBeInTheDocument();
		expect(history.location.pathname).toBe('/auth/sign-in');
	});

	test('toggles the password input visibility', () => {
		const { container } = renderSignIn();

		expect(getPasswordInput(container)).toHaveAttribute('type', 'password');

		fireEvent.click(container.querySelector('svg'));

		expect(getPasswordInput(container)).toHaveAttribute('type', 'text');
	});

	test('shows the submit button loading state while authentication is in progress', async () => {
		authenticateUserMock.mockImplementation(() => {});

		const { container } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(await screen.findByText('Cargando')).toBeInTheDocument();
	});

	test('signs in admins, stores tokens, and redirects to the admin dashboard', async () => {
		const session = buildSession();
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.onSuccess(session);
		});

		const { container, history } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		await waitFor(() => {
			expect(history.location.pathname).toBe('/admin/dashboard');
		});

		expect(CognitoUserPool).toHaveBeenCalledWith({
			UserPoolId: 'pool-id',
			ClientId: 'client-id'
		});
		expect(AuthenticationDetails).toHaveBeenCalledWith({
			Username: 'admin@example.com',
			Password: 'Secret123!'
		});
		expect(CognitoUser).toHaveBeenCalledWith({
			Username: 'admin@example.com',
			Pool: expect.objectContaining({
				kind: 'user-pool',
				poolData: {
					UserPoolId: 'pool-id',
					ClientId: 'client-id'
				}
			})
		});
		expect(authenticateUserMock).toHaveBeenCalledWith(
			expect.objectContaining({
				kind: 'authentication-details',
				authenticationData: {
					Username: 'admin@example.com',
					Password: 'Secret123!'
				}
			}),
			expect.objectContaining({
				onSuccess: expect.any(Function),
				onFailure: expect.any(Function),
				newPasswordRequired: expect.any(Function)
			})
		);
		expect(localStorage.getItem('accessToken')).toBe('access-token');
		expect(localStorage.getItem('idToken')).toBe('id-token');
		expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
		expect(console.log).toHaveBeenCalledWith('Authentication Successful!', session);
	});

	test('signs in drivers and redirects to the driver deliveries page', async () => {
		isDriver.mockReturnValue(true);
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.onSuccess(buildSession());
		});

		const { container, history } = renderSignIn();

		fillCredentials(container, { email: 'driver@example.com' });
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		await waitFor(() => {
			expect(history.location.pathname).toBe('/driver/deliveries');
		});
	});

	test('shows an error when Cognito authentication fails', async () => {
		const error = new Error('bad credentials');
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.onFailure(error);
		});

		const { container, history } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(await screen.findByText('Credenciales erróneas')).toBeInTheDocument();
		expect(history.location.pathname).toBe('/auth/sign-in');
		expect(console.error).toHaveBeenCalledWith('Authentication failed:', error);
	});

	test('opens the new password modal when Cognito requires a password change', async () => {
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.newPasswordRequired({ email: 'admin@example.com' });
		});

		const { container } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(await screen.findByTestId('new-password-modal')).toBeInTheDocument();
	});

	test('closes the new password modal when dismissed', async () => {
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.newPasswordRequired({ email: 'admin@example.com' });
		});

		const { container } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		await screen.findByTestId('new-password-modal');
		fireEvent.click(screen.getByRole('button', { name: 'close modal' }));

		await waitFor(() => {
			expect(screen.queryByTestId('new-password-modal')).not.toBeInTheDocument();
		});
	});

	test('submits a replacement password and redirects admins to the dashboard', async () => {
		const session = buildSession({
			accessToken: 'new-access-token',
			idToken: 'new-id-token',
			refreshToken: 'new-refresh-token'
		});

		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.newPasswordRequired({ email: 'admin@example.com' });
		});
		completeNewPasswordChallengeMock.mockImplementation((newPassword, requiredAttributes, callbacks) => {
			callbacks.onSuccess(session);
		});

		const { container, history } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		await screen.findByTestId('new-password-modal');
		fireEvent.click(screen.getByRole('button', { name: 'submit new password' }));

		await waitFor(() => {
			expect(history.location.pathname).toBe('/admin/dashboard');
		});

		expect(completeNewPasswordChallengeMock).toHaveBeenCalledWith(
			'UpdatedPass1!',
			null,
			expect.objectContaining({
				onSuccess: expect.any(Function),
				onFailure: expect.any(Function)
			})
		);
		expect(localStorage.getItem('accessToken')).toBe('new-access-token');
		expect(localStorage.getItem('idToken')).toBe('new-id-token');
		expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
		expect(console.log).toHaveBeenCalledWith('New password submitted successfully!', session);
	});

	test('submits a replacement password and redirects drivers to their deliveries page', async () => {
		isDriver.mockReturnValue(true);
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.newPasswordRequired({ email: 'driver@example.com' });
		});
		completeNewPasswordChallengeMock.mockImplementation((newPassword, requiredAttributes, callbacks) => {
			callbacks.onSuccess(buildSession());
		});

		const { container, history } = renderSignIn();

		fillCredentials(container, { email: 'driver@example.com' });
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		await screen.findByTestId('new-password-modal');
		fireEvent.click(screen.getByRole('button', { name: 'submit new password' }));

		await waitFor(() => {
			expect(history.location.pathname).toBe('/driver/deliveries');
		});
	});

	test('shows an error when submitting a replacement password fails', async () => {
		const error = new Error('new password failed');
		authenticateUserMock.mockImplementation((details, callbacks) => {
			callbacks.newPasswordRequired({ email: 'admin@example.com' });
		});
		completeNewPasswordChallengeMock.mockImplementation((newPassword, requiredAttributes, callbacks) => {
			callbacks.onFailure(error);
		});

		const { container } = renderSignIn();

		fillCredentials(container);
		fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		await screen.findByTestId('new-password-modal');
		fireEvent.click(screen.getByRole('button', { name: 'submit new password' }));

		expect(await screen.findByText('Error al guardar la nueva contraseña. Intenta de nuevo.')).toBeInTheDocument();
		expect(console.error).toHaveBeenCalledWith('Failed to submit new password:', error);
	});
});