import type { ExportQuerySchema } from 'openapi';
import useAPI from '../useApi/useApi.js';

export const useExportApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createExport = async (payload: ExportQuerySchema) => {
        const path = `api/admin/features-batch/export`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        loading,
        errors,
        createExport,
    };
};
