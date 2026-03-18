import api from './axios';

export const authService = {
    // Authentication Flow
    register: (data) => api.post('/auth/register', data),

    verifyEmail: (email, verificationCode) =>
        api.post('/auth/verify-email', { email, verificationCode }),

    resendVerification: (email) =>
        api.post('/auth/resend-verification', { email }),

    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    googleAuth: (idToken, accountType) =>
        api.post('/auth/google', { idToken, accountType }),

    // Password Reset Flow
    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),

    validateResetToken: (token) =>
        api.post('/auth/validate-reset-token', { token }),

    resetPassword: (token, newPassword, confirmNewPassword) =>
        api.post('/auth/reset-password', { token, newPassword, confirmNewPassword }),

    // Current User
    getCurrentUser: () =>
        api.get('/auth/me'),
};
