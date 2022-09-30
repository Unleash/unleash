import { useCallback } from 'react';
import useAPI from '../useApi/useApi';

export const useAuthResetPasswordApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const resetPassword = useCallback(
        (value: { token: string; password: string }) => {
            const req = createRequest('auth/reset/password', {
                method: 'POST',
                body: JSON.stringify(value),
            });

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    return {
        resetPassword,
        errors,
        loading,
    };
};
