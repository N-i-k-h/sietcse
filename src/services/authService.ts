import api from './api';

export const authService = {
    // Login
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Change password
    changePassword: async (userId: string, newPassword: string) => {
        const response = await api.post('/auth/change-password', { userId, newPassword });
        return response.data;
    },
};
