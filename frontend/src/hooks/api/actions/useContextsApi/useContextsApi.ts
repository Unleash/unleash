import useAPI from '../useApi/useApi.js';

const useContextsApi = (projectId?: string) => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = projectId
        ? `api/admin/projects/${projectId}/context`
        : 'api/admin/context';

    const validateContextName = async (name: string) => {
        const path = `${URI}/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });

        return makeRequest(req.caller, req.id);
    };

    // @ts-expect-error
    const createContext = async (payload: IContext) => {
        const path = URI;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    // @ts-expect-error
    const updateContext = async (context: IContext) => {
        const path = `${URI}/${context.name}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(context),
        });

        return makeRequest(req.caller, req.id);
    };

    const removeContext = async (contextName: string) => {
        const path = `${URI}/${contextName}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    return {
        createContext,
        validateContextName,
        updateContext,
        removeContext,
        errors,
        loading,
    };
};

export default useContextsApi;
