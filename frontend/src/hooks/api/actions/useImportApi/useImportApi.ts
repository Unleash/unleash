import useAPI from '../useApi/useApi.js';

export interface ImportQuerySchema {
    project: string;
    environment: string;
    data: object;
}

export const useImportApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const createImport = async (payload: ImportQuerySchema) => {
        const path = `api/admin/features-batch/import`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        loading,
        errors,
        createImport,
    };
};
