import type { ITagPayload } from 'interfaces/tags';
import useAPI from '../useApi/useApi.js';

const useTagTypesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createTag = async (payload: ITagPayload) => {
        const path = `api/admin/tag-types`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    const validateTagName = async (name: string) => {
        const path = `api/admin/tag-types/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });

        return makeRequest(req.caller, req.id);
    };
    const updateTagType = async (tagName: string, payload: ITagPayload) => {
        const path = `api/admin/tag-types/${tagName}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteTagType = async (tagName: string) => {
        const path = `api/admin/tag-types/${tagName}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    return {
        createTag,
        validateTagName,
        updateTagType,
        deleteTagType,
        errors,
        loading,
    };
};

export default useTagTypesApi;
