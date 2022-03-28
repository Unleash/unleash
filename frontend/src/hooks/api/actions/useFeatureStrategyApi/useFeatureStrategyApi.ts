import { IStrategyPayload } from 'interfaces/strategy';
import useAPI from '../useApi/useApi';

const useFeatureStrategyApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addStrategyToFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        payload: IStrategyPayload
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'addStrategyToFeature'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const deleteStrategyFromFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            { method: 'DELETE' },
            'deleteStrategyFromFeature'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const updateStrategyOnFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string,
        payload: IStrategyPayload
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'updateStrategyOnFeature'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        addStrategyToFeature,
        updateStrategyOnFeature,
        deleteStrategyFromFeature,
        loading,
        errors,
    };
};

export default useFeatureStrategyApi;
