import useAPI from '../useApi/useApi.js';

export const useUserAccessRequestsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const approveAccessRequest = async (id: string, rootRole: number) => {
        const requestId = 'approveAccessRequest';
        const req = createRequest(
            `api/admin/user-access-requests/${id}/approve`,
            {
                method: 'POST',
                body: JSON.stringify({ rootRole }),
            },
            requestId,
        );

        return makeRequest(req.caller, req.id);
    };

    return {
        approveAccessRequest,
        loading,
        errors,
    };
};
