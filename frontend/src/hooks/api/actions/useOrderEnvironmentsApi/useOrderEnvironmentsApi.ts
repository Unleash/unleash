import useAPI from '../useApi/useApi';
import type { OrderEnvironmentsSchema } from 'openapi';

export const useOrderEnvironmentApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const orderEnvironments = async (payload: OrderEnvironmentsSchema) => {
        const req = createRequest('api/admin/order-environments', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        await makeRequest(req.caller, req.id);
    };

    return {
        orderEnvironments,
        errors,
        loading,
    };
};
