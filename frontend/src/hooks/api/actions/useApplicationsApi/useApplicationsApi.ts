import useAPI from '../useApi/useApi.js';

const useApplicationsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/metrics/applications';

    const deleteApplication = async (appName: string) => {
        const path = `${URI}/${encodeURIComponent(appName)}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    return {
        deleteApplication,
        errors,
        loading,
    };
};

export default useApplicationsApi;
