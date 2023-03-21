import useAPI from '../useApi/useApi';
import type { TagSchema, TagsBulkAddSchema } from 'openapi';

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

    const bulkUpdateTags = async (payload: TagsBulkAddSchema) => {
        const path = `api/admin/tags/features`;
        const req = createRequest(path, {
            method: 'PUT',
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
        bulkUpdateTags,
        errors,
        loading,
    };
};

export default useTagApi;
