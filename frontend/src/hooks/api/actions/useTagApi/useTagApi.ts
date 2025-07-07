import useAPI from '../useApi/useApi.js';
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

        return makeRequest(req.caller, req.id);
    };

    const bulkUpdateTags = async (
        payload: TagsBulkAddSchema,
        projectId: string,
    ) => {
        const path = `api/admin/projects/${projectId}/tags`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        createTag,
        bulkUpdateTags,
        errors,
        loading,
    };
};

export default useTagApi;
