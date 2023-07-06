import useAPI from '../useApi/useApi';

export const useLoginHistoryApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const downloadCSV = async () => {
        const requestId = 'downloadCSV';
        const req = createRequest(
            'api/admin/logins',
            {
                method: 'GET',
                responseType: 'blob',
                headers: { Accept: 'text/csv' },
            },
            requestId
        );

        const file = await (await makeRequest(req.caller, req.id)).blob();
        const url = window.URL.createObjectURL(file);
        window.location.assign(url);
    };

    const removeAllEvents = async () => {
        const requestId = 'removeAllEvents';
        const req = createRequest(
            'api/admin/logins',
            { method: 'DELETE' },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        downloadCSV,
        removeAllEvents,
        errors,
        loading,
    };
};
