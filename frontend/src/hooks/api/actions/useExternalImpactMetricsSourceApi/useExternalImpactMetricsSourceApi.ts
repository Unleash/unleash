import useAPI from '../useApi/useApi.js';
import type { ExternalImpactMetricsSource } from 'hooks/api/getters/useExternalImpactMetricsSource/useExternalImpactMetricsSource';

const ENDPOINT = 'api/admin/impact-metrics/external-source';

export const useExternalImpactMetricsSourceApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const setExternalImpactMetricsSource = async (
        source: ExternalImpactMetricsSource,
    ): Promise<void> => {
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(source),
            },
            'setExternalImpactMetricsSource',
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        setExternalImpactMetricsSource,
        errors,
        loading,
    };
};
