import useAPI from '../useApi/useApi.js';
import type { RenameTagSchema, TagSchema, TagsBulkAddSchema } from 'openapi';

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

    const tagPath = (type: string, value: string) =>
        `api/admin/tags/${encodeURIComponent(type)}/${encodeURIComponent(value)}`;

    const deleteTag = async (type: string, value: string) => {
        const req = createRequest(tagPath(type, value), { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    const renameTag = async (
        type: string,
        value: string,
        payload: RenameTagSchema,
    ) => {
        const req = createRequest(`${tagPath(type, value)}/rename`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        createTag,
        bulkUpdateTags,
        deleteTag,
        renameTag,
        errors,
        loading,
    };
};

export default useTagApi;
