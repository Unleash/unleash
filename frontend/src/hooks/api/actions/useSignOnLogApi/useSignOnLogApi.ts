import useAPI from '../useApi/useApi';

export const useSignOnLogApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const removeEvent = async (eventId: number) => {
        const requestId = 'removeEvent';
        const req = createRequest(
            `api/admin/sign-on-log/${eventId}`,
            { method: 'DELETE' },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        removeEvent,
        errors,
        loading,
    };
};
