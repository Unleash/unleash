import {
    IFeatureStrategyPayload,
    IFeatureStrategy,
    IFeatureStrategySortOrder,
} from 'interfaces/strategy';
import useAPI from '../useApi/useApi';

const useFeatureStrategyApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addStrategyToFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        payload: IFeatureStrategyPayload
    ): Promise<IFeatureStrategy> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'addStrategyToFeature'
        );
        return (await makeRequest(req.caller, req.id)).json();
    };

    const deleteStrategyFromFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            { method: 'DELETE' },
            'deleteStrategyFromFeature'
        );
        await makeRequest(req.caller, req.id);
    };

    const updateStrategyOnFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string,
        payload: IFeatureStrategyPayload
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'updateStrategyOnFeature'
        );
        await makeRequest(req.caller, req.id);
    };

    const setStrategiesSortOrder = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        payload: IFeatureStrategySortOrder[]
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/set-sort-order`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'setStrategiesSortOrderOnFeature'
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        addStrategyToFeature,
        updateStrategyOnFeature,
        deleteStrategyFromFeature,
        setStrategiesSortOrder,
        loading,
        errors,
    };
};

export default useFeatureStrategyApi;
