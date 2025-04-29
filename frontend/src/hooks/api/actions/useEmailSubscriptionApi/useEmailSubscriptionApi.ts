import useAPI from '../useApi/useApi.js';

export const useEmailSubscriptionApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const subscribe = async (subscriptionName: string) => {
        const path = `api/admin/email-subscription/${subscriptionName}`;
        const req = createRequest(path, {
            method: 'PUT',
        });

        await makeRequest(req.caller, req.id);
    };

    const unsubscribe = async (subscriptionName: string) => {
        const path = `api/admin/email-subscription/${subscriptionName}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        await makeRequest(req.caller, req.id);
    };

    return {
        subscribe,
        unsubscribe,
        errors,
        loading,
    };
};
