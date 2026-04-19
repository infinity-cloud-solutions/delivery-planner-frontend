import '@testing-library/jest-dom';

import { CognitoUserPool } from 'amazon-cognito-identity-js';
import jwtDecode from 'jsonwebtoken/decode';
import {
	getAccessToken,
	getEmailFromToken,
	isAdmin,
	isDriver,
	getFullNameFromLocalStorage,
	logout,
	validateJWT
} from 'security';

const mockGetCurrentUser = jest.fn();
const mockSignOut = jest.fn();

jest.mock('jsonwebtoken/decode', () => jest.fn());

jest.mock('amazon-cognito-identity-js', () => ({
	CognitoUser: jest.fn(),
	CognitoUserPool: jest.fn()
}));

describe('security helpers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
		process.env.REACT_APP_COGNITO_USER_POOL_ID = 'pool-id';
		process.env.REACT_APP_COGNITO_CLIENT_ID = 'client-id';
		process.env.REACT_APP_COGNITO_ISS = 'https://issuer.example.com';
		jest.spyOn(console, 'error').mockImplementation(() => {});
		CognitoUserPool.mockImplementation(() => ({
			getCurrentUser: mockGetCurrentUser
		}));
		mockGetCurrentUser.mockReturnValue({ signOut: mockSignOut });
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('signs out the current Cognito user and clears stored tokens', () => {
		localStorage.setItem('accessToken', 'access-token');
		localStorage.setItem('idToken', 'id-token');
		localStorage.setItem('refreshToken', 'refresh-token');

		logout();

		expect(CognitoUserPool).toHaveBeenCalledWith({
			UserPoolId: 'pool-id',
			ClientId: 'client-id'
		});
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem('accessToken')).toBeNull();
		expect(localStorage.getItem('idToken')).toBeNull();
		expect(localStorage.getItem('refreshToken')).toBeNull();
	});

	test('still clears stored tokens when no Cognito user is available', () => {
		mockGetCurrentUser.mockReturnValue(null);
		localStorage.setItem('idToken', 'id-token');

		logout();

		expect(mockSignOut).not.toHaveBeenCalled();
		expect(localStorage.getItem('idToken')).toBeNull();
	});

	test('reads the id token from local storage as the access token', () => {
		localStorage.setItem('idToken', 'stored-id-token');

		expect(getAccessToken()).toBe('stored-id-token');
	});

	test('validates a jwt when issuer and expiration match the expected values', () => {
		localStorage.setItem('idToken', 'valid-token');
		jwtDecode.mockReturnValue({
			payload: {
				iss: 'https://issuer.example.com',
				exp: Math.floor(Date.now() / 1000) + 3600
			}
		});

		expect(validateJWT()).toBe(true);
		expect(jwtDecode).toHaveBeenCalledWith('valid-token', { complete: true });
	});

	test('logs out when the jwt issuer does not match the configured issuer', () => {
		localStorage.setItem('idToken', 'bad-issuer-token');
		localStorage.setItem('refreshToken', 'refresh-token');
		jwtDecode.mockReturnValue({
			payload: {
				iss: 'https://different.example.com',
				exp: Math.floor(Date.now() / 1000) + 3600
			}
		});

		expect(validateJWT()).toBe(false);
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem('refreshToken')).toBeNull();
		expect(console.error).toHaveBeenCalledWith(
			'JWT validation error:',
			'Token no concuerda con el token de la base de datos'
		);
	});

	test('logs out when the jwt is expired or decoding fails', () => {
		localStorage.setItem('idToken', 'expired-token');
		jwtDecode.mockReturnValueOnce({
			payload: {
				iss: 'https://issuer.example.com',
				exp: Math.floor(Date.now() / 1000) - 1
			}
		});

		expect(validateJWT()).toBe(false);
		expect(console.error).toHaveBeenCalledWith('JWT validation error:', 'Tu sesión ha expirado');

		localStorage.setItem('idToken', 'decode-error-token');
		jwtDecode.mockImplementationOnce(() => {
			throw new Error('decode failed');
		});

		expect(validateJWT()).toBe(false);
		expect(console.error).toHaveBeenCalledWith('JWT validation error:', 'decode failed');
	});

	test('detects driver membership from the Cognito groups claim', () => {
		localStorage.setItem('idToken', 'driver-token');
		jwtDecode.mockReturnValue({
			payload: {
				'cognito:groups': [ 'Repartidor', 'Other' ]
			}
		});

		expect(isDriver()).toBe(true);

		jwtDecode.mockReturnValue({
			payload: {
				'cognito:groups': [ 'Admin' ]
			}
		});
		expect(isDriver()).toBe(false);

		jwtDecode.mockReturnValue({
			payload: {}
		});
		expect(isDriver()).toBeUndefined();
	});

	test('returns false for drivers when there is no token or decoding fails', () => {
		expect(isDriver()).toBe(false);

		localStorage.setItem('idToken', 'driver-token');
		jwtDecode.mockImplementationOnce(() => {
			throw new Error('driver decode failed');
		});

		expect(isDriver()).toBe(false);
		expect(console.error).toHaveBeenCalledWith('Error decoding token:', 'driver decode failed');
	});

	test('detects admin membership from the Cognito groups claim', () => {
		localStorage.setItem('idToken', 'admin-token');
		jwtDecode.mockReturnValue({
			payload: {
				'cognito:groups': [ 'Admin', 'Other' ]
			}
		});

		expect(isAdmin()).toBe(true);

		jwtDecode.mockReturnValue({
			payload: {
				'cognito:groups': [ 'Repartidor' ]
			}
		});
		expect(isAdmin()).toBe(false);

		jwtDecode.mockReturnValue({
			payload: {}
		});
		expect(isAdmin()).toBeUndefined();
	});

	test('returns false for admins when there is no token or decoding fails', () => {
		expect(isAdmin()).toBe(false);

		localStorage.setItem('idToken', 'admin-token');
		jwtDecode.mockImplementationOnce(() => {
			throw new Error('admin decode failed');
		});

		expect(isAdmin()).toBe(false);
		expect(console.error).toHaveBeenCalledWith('Error decoding token:', 'admin decode failed');
	});

	test('returns a trimmed full name from the id token payload', () => {
		localStorage.setItem('idToken', 'profile-token');
		jwtDecode.mockReturnValue({
			payload: {
				given_name: 'Marco',
				family_name: 'Burgos'
			}
		});

		expect(getFullNameFromLocalStorage()).toBe('Marco Burgos');

		jwtDecode.mockReturnValue({
			payload: {
				given_name: 'Marco'
			}
		});
		expect(getFullNameFromLocalStorage()).toBe('Marco');
	});

	test('returns null when the full name token is missing or malformed', () => {
		localStorage.setItem('idToken', 'bad-profile-token');
		jwtDecode.mockReturnValueOnce(null);

		expect(getFullNameFromLocalStorage()).toBeNull();
		expect(console.error).toHaveBeenCalledWith('idToken not found in local storage');

		jwtDecode.mockReturnValueOnce({
			get payload() {
				throw new Error('bad profile payload');
			}
		});

		expect(getFullNameFromLocalStorage()).toBeNull();
		expect(console.error).toHaveBeenCalledWith('Error parsing idToken payload:', 'bad profile payload');
	});

	test('returns the email address from the id token payload', () => {
		localStorage.setItem('idToken', 'email-token');
		jwtDecode.mockReturnValue({
			payload: {
				email: 'driver@example.com'
			}
		});

		expect(getEmailFromToken()).toBe('driver@example.com');

		jwtDecode.mockReturnValue({
			payload: {}
		});
		expect(getEmailFromToken()).toBe('');
	});

	test('returns null when the email token is missing or malformed', () => {
		localStorage.setItem('idToken', 'bad-email-token');
		jwtDecode.mockReturnValueOnce(null);

		expect(getEmailFromToken()).toBeNull();
		expect(console.error).toHaveBeenCalledWith('idToken not found in local storage');

		jwtDecode.mockReturnValueOnce({
			get payload() {
				throw new Error('bad email payload');
			}
		});

		expect(getEmailFromToken()).toBeNull();
		expect(console.error).toHaveBeenCalledWith('Error parsing idToken payload:', 'bad email payload');
	});
});