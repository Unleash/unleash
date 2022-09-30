import useAPI from '../useApi/useApi';

const useApplicationsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/metrics/applications';

    const storeApplicationMetaData = async (
        appName: string,
        key: string,
        value: string
    ) => {
        const data: { [key: string]: any } = {};
        data[key] = value;
        const path = `${URI}/${appName}`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    const deleteApplication = async (appName: string) => {
        const path = `${URI}/${encodeURIComponent(appName)}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        storeApplicationMetaData,
        deleteApplication,
        errors,
        loading,
    };
};

export default useApplicationsApi;
