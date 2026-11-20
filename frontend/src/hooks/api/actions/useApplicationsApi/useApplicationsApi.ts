import useAPI from '../useApi/useApi.js';
import type { CreateApplicationRequestSchema } from 'openapi';

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

    const createApplication = async (
        application: CreateApplicationRequestSchema,
    ) => {
        const req = createRequest('api/admin/applications', {
            method: 'POST',
            body: JSON.stringify(application),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        createApplication,
        deleteApplication,
        errors,
        loading,
    };
};

export default useApplicationsApi;
