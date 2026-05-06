import useAPI from '../useApi/useApi.js';

const ENDPOINT = 'api/admin/impact-metrics/test-source';

export type TestExternalImpactMetricsSourceResult = { metrics: string[] };

export const useTestExternalImpactMetricsSourceApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const testExternalImpactMetricsSource = async (
        url: string,
    ): Promise<TestExternalImpactMetricsSourceResult> => {
        const req = createRequest(
            ENDPOINT,
            { method: 'POST', body: JSON.stringify({ url }) },
            'testExternalImpactMetricsSource',
        );
        const res = await makeRequest(req.caller, req.id);
        return res.json();
    };

    return { testExternalImpactMetricsSource, errors, loading };
};
