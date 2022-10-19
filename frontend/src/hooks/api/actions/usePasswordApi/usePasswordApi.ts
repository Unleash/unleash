import useAPI from '../useApi/useApi';

interface IChangePasswordPayload {
    password: string;
    confirmPassword: string;
}

export const usePasswordApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const changePassword = async (payload: IChangePasswordPayload) => {
        const req = createRequest('api/admin/user/change-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        changePassword,
        errors,
        loading,
    };
};
