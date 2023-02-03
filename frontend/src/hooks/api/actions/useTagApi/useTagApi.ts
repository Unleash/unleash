import useAPI from '../useApi/useApi';
import { TagSchema } from 'openapi/models/tagSchema';

const useTagApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createTag = async (payload: TagSchema) => {
        const path = `api/admin/tags`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            return await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        createTag,
        errors,
        loading,
    };
};

export default useTagApi;
