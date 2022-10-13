import useAPI from '../useApi/useApi';

export const useSuggestChangesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const approveChangeRequest = async (id: string) => {
        const path = `api/admin/suggest-changes/${id}/approve`;
        const req = createRequest(path, { method: 'POST' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const requestChangesOnChangeRequest = async (id: string) => {
        const path = `api/admin/suggest-changes/${id}/request-changes`;
        const req = createRequest(path, {
            method: 'POST',
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const applyChangeRequest = async (id: string) => {
        const path = `api/admin/suggest-changes/${id}/apply`;
        const req = createRequest(path, { method: 'POST' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        approveChangeRequest,
        requestChangesOnChangeRequest,
        applyChangeRequest,
        errors,
        loading,
    };
};
