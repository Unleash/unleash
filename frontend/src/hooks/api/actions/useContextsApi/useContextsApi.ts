import { IContext } from '../../../../interfaces/context';
import useAPI from '../useApi/useApi';

const useContextsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/context';

    const validateContextName = async (name: string) => {
        const path = `${URI}/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const createContext = async (payload: IContext) => {
        const path = URI;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const updateContext = async (context: IContext) => {
        const path = `${URI}/${context.name}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(context),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const removeContext = async (contextName: string) => {
        const path = `${URI}/${contextName}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
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
