import { ITagPayload } from '../../../../interfaces/tags';
import useAPI from '../useApi/useApi';

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

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const validateTagName = async (name: string) => {
        const path = `api/admin/tag-types/validate`;
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
    const updateTagType = async (tagName: string, payload: ITagPayload) => {
        const path = `api/admin/tag-types/${tagName}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    const deleteTagType = async (tagName: string) => {
        const path = `api/admin/tag-types/${tagName}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        createTag,
        validateTagName,
        updateTagType,
        deleteTagType,
        errors,
        loading
    };
};

export default useTagTypesApi;