import useAPI from '../useApi/useApi';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export interface ImportQuerySchema {
    project: string;
    environment: string;
    data: object;
}

export const useImportApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { trackEvent } = usePlausibleTracker();

    const createImport = async (payload: ImportQuerySchema) => {
        const path = `api/admin/features-batch/import`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            trackEvent('export_import', {
                props: {
                    eventType: `features imported`,
                },
            });
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
