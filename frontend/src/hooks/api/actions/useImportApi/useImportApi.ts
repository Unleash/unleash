import { ExportQuerySchema } from 'openapi';
import useAPI from '../useApi/useApi';

export interface ImportQuerySchema {}

export const useImportApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createImport = async (payload: ImportQuerySchema) => {
        const path = `api/admin/features-batch/full-import`;
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

    return {
        loading,
        errors,
        createImport,
    };
};
