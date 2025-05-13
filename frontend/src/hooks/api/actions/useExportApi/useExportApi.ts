import type { ExportQuerySchema } from 'openapi';
import useAPI from '../useApi/useApi.js';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const useExportApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { trackEvent } = usePlausibleTracker();

    const createExport = async (payload: ExportQuerySchema) => {
        const path = `api/admin/features-batch/export`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);
        trackEvent('export_import', {
            props: {
                eventType: `features exported`,
            },
        });
        return res;
    };

    return {
        loading,
        errors,
        createExport,
    };
};
