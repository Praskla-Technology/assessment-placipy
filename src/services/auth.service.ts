import axios from 'axios';

// Define user roles
export type UserRole = 'Student' | 'PTO' | 'PTS' | 'Admin';

// Define user interface
export interface User {
    email: string;
    role: UserRole;
    accessToken: string;
}

// Define challenge response interface
export interface ChallengeResponse {
    challenge: 'NEW_PASSWORD_REQUIRED';
    session: string;
    username: string;
}

// Authentication service
class AuthService {
    private apiUrl = '/api/users'; // Backend API base URL (using proxy)

    /**
     * Normalize role name to match expected UserRole type
     * @param role Role string from backend
     * @returns Normalized UserRole
     */
    private normalizeRole(role: string): UserRole {
        // Handle different possible role representations
        switch (role.toLowerCase()) {
            case 'student':
            case 'student user':
                return 'Student';
            case 'pto':
            case 'placement training officer':
            case 'placementtrainingofficer':
                return 'PTO';
            case 'pts':
            case 'placement training staff':
            case 'placementtrainingstaff':
            case 'placement tracking supervisor':
            case 'placementtrackingsupervisor':
                return 'PTS';
            case 'admin':
            case 'administrator':
                return 'Admin';
            default:
                // If we can't match, return the role as-is (will be validated elsewhere)
                // This maintains backward compatibility
                if (['Student', 'PTO', 'PTS', 'Admin'].includes(role)) {
                    return role as UserRole;
                }
                // Default to Student if we can't determine the role
                console.warn(`Unknown role: ${role}, defaulting to Student`);
                return 'Student';
        }
    }

    /**
     * Login user with email and password
     * @param email 
     * @param password 
     * @returns User object with role and access token
     */
    async login(email: string, password: string): Promise<User | ChallengeResponse> {
        try {
            console.log('Attempting login with:', { email });

            // Call backend login endpoint
            const response = await axios.post(`${this.apiUrl}/login`, {
                username: email, // Using email as username
                password
            }, {
                timeout: 10000 // 10 second timeout
            });

            console.log('Login response:', response.data);

            // Check if we have a challenge
            if (response.data.challenge === 'NEW_PASSWORD_REQUIRED') {
                return {
                    challenge: 'NEW_PASSWORD_REQUIRED',
                    session: response.data.session,
                    username: email
                };
            }

            const { accessToken } = response.data;

            // Get user role from backend
            const role = await this.getUserRole(accessToken);

            // Store token in localStorage for future requests
            localStorage.setItem('accessToken', accessToken);

            return {
                email,
                role,
                accessToken
            };
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.response) {
                // Server responded with error status
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);

                const message = error.response.data?.message || error.response.statusText || 'Unknown server error';

                // Special handling for authentication errors
                if (error.response.status === 401) {
                    throw new Error('Invalid email or password. Please check your credentials and try again.');
                }

                throw new Error(`Login failed: ${message} (${error.response.status})`);
            } else if (error.request) {
                // Request was made but no response received
                console.error('No response received:', error.request);
                throw new Error('Network error: Could not connect to the authentication server. Please ensure the backend is running on port 3001.');
            } else {
                // Something else happened
                console.error('Error message:', error.message);
                throw new Error('Login failed: ' + error.message);
            }
        }
    }

    /**
     * Respond to NEW_PASSWORD_REQUIRED challenge
     * @param username 
     * @param currentPassword 
     * @param newPassword 
     * @param session 
     * @returns User object with role and access token
     */
    async respondToNewPasswordChallenge(
        username: string,
        currentPassword: string,
        newPassword: string,
        session: string
    ): Promise<User | { sessionExpired: true }> {
        try {
            console.log('Responding to NEW_PASSWORD_REQUIRED challenge for:', username);

            // Call backend endpoint to respond to challenge
            const response = await axios.post(`${this.apiUrl}/respond-to-new-password-challenge`, {
                username,
                password: currentPassword,
                newPassword,
                session
            }, {
                timeout: 10000 // 10 second timeout
            });

            console.log('Challenge response:', response.data);

            const { accessToken } = response.data;

            // Get user role from backend
            const role = await this.getUserRole(accessToken);

            // Store token in localStorage for future requests
            localStorage.setItem('accessToken', accessToken);

            // For the email, we'll use the username since that's what we have
            return {
                email: username,
                role,
                accessToken
            };
        } catch (error: any) {
            console.error('Challenge response error:', error);

            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);

                const message = error.response.data?.message || error.response.statusText || 'Unknown server error';

                // Handle session expired errors specifically
                if (message.includes('session has expired') || message.includes('Invalid session for the user')) {
                    return { sessionExpired: true };
                }

                throw new Error(`Failed to set new password: ${message} (${error.response.status})`);
            } else if (error.request) {
                throw new Error('Network error: Could not connect to the authentication server.');
            } else {
                throw new Error('Failed to set new password: ' + error.message);
            }
        }
    }

    /**
     * Get user role from backend
     * @param token Access token
     * @returns User role
     */
    async getUserRole(token: string): Promise<UserRole> {
        try {
            console.log('Fetching user role with token:', token ? 'Bearer ***' : 'No token');

            // Set authorization header
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000 // 10 second timeout
            };

            // Call backend profile endpoint to get user information
            const response = await axios.get(`${this.apiUrl}/profile`, config);

            console.log('Profile response:', response.data);

            // Extract role from response
            const { role } = response.data.user;

            // Normalize role name to match expected values
            const normalizedRole = this.normalizeRole(role);

            // Validate role (this is now redundant but kept for safety)
            const validRoles: UserRole[] = ['Student', 'PTO', 'PTS', 'Admin'];
            if (!validRoles.includes(normalizedRole)) {
                throw new Error(`Invalid user role: ${role}`);
            }

            return normalizedRole;
        } catch (error: any) {
            console.error('Error getting user role:', error);

            if (error.response) {
                console.error('Role check response data:', error.response.data);
                console.error('Role check response status:', error.response.status);

                const message = error.response.data?.message || error.response.statusText || 'Unknown server error';

                // Special handling for authentication errors
                if (error.response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }

                if (error.response.status === 403) {
                    throw new Error('Access forbidden. Your token may be invalid or expired.');
                }

                throw new Error(`Role verification failed: ${message} (${error.response.status})`);
            } else if (error.request) {
                throw new Error('Network error: Could not connect to the server for role verification. Please ensure the backend is running on port 3001.');
            } else {
                throw new Error('Role verification failed: ' + error.message);
            }
        }
    }

    /**
     * Check if user is authenticated
     * @returns True if user is authenticated, false otherwise
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem('accessToken');
        return !!token;
    }

    /**
     * Get stored access token
     * @returns Access token or null
     */
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem('accessToken');
    }

    /**
     * Get dashboard path based on user role
     * @param role User role
     * @returns Dashboard path
     */
    getDashboardPath(role: UserRole): string {
        switch (role) {
            case 'Student':
                return '/student';
            case 'PTO':
                return '/pto-dashboard';
            case 'PTS':
                return '/pts';
            case 'Admin':
                return '/company-admin';
            default:
                return '/'; // Redirect to login for unknown roles
        }
    }
}

export default new AuthService();