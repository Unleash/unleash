import useAPI from '../useApi/useApi';

export const useAccessOverviewApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const downloadCSV = async () => {
        const requestId = 'downloadCSV';
        const req = createRequest(
            'api/admin/access/overview',
            {
                method: 'GET',
                responseType: 'blob',
                headers: { Accept: 'text/csv' },
            },
            requestId,
        );

        const file = await (await makeRequest(req.caller, req.id)).blob();
        const url = window.URL.createObjectURL(file);
        window.location.assign(url);
    };

    return {
        downloadCSV,
        errors,
        loading,
    };
};
