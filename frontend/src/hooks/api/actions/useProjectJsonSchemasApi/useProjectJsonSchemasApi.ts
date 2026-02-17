import useAPI from '../useApi/useApi.js';

export const useProjectJsonSchemasApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createJsonSchema = async (
        project: string,
        payload: { name: string; schema: object },
    ) => {
        const path = `api/admin/projects/${project}/json-schemas`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    const updateJsonSchema = async (
        project: string,
        schemaId: string,
        payload: { name: string; schema: object },
    ) => {
        const path = `api/admin/projects/${project}/json-schemas/${schemaId}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteJsonSchema = async (project: string, schemaId: string) => {
        const path = `api/admin/projects/${project}/json-schemas/${schemaId}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    return {
        createJsonSchema,
        updateJsonSchema,
        deleteJsonSchema,
        errors,
        loading,
    };
};
