import useAPI from '../useApi/useApi';

export const useSignOnLogApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const downloadCSV = async () => {
        const requestId = 'downloadCSV';
        const req = createRequest(
            'api/admin/signons',
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

    const removeEvent = async (eventId: number) => {
        const requestId = 'removeEvent';
        const req = createRequest(
            `api/admin/signons/${eventId}`,
            { method: 'DELETE' },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    const removeAllEvents = async () => {
        const requestId = 'removeAllEvents';
        const req = createRequest(
            'api/admin/signons',
            { method: 'DELETE' },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        downloadCSV,
        removeEvent,
        removeAllEvents,
        errors,
        loading,
    };
};
