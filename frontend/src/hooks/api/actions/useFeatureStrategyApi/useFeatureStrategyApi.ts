import type {
    IFeatureStrategyPayload,
    IFeatureStrategy,
    IFeatureStrategySortOrder,
} from 'interfaces/strategy';
import useAPI from '../useApi/useApi';
import { useRecentlyUsedConstraints } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/RecentlyUsedConstraints/useRecentlyUsedConstraints';
import { useUiFlag } from 'hooks/useUiFlag';

const useFeatureStrategyApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const { addItem: addToRecentlyUsedConstraints } =
        useRecentlyUsedConstraints();
    const addEditStrategyEnabled = useUiFlag('addEditStrategy');

    const addStrategyToFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        payload: IFeatureStrategyPayload,
    ): Promise<IFeatureStrategy> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'addStrategyToFeature',
        );
        const result = await makeRequest(req.caller, req.id);

        if (
            addEditStrategyEnabled &&
            payload.constraints &&
            payload.constraints.length > 0
        ) {
            addToRecentlyUsedConstraints(payload.constraints);
        }

        return result.json();
    };

    const deleteStrategyFromFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string,
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            { method: 'DELETE' },
            'deleteStrategyFromFeature',
        );
        await makeRequest(req.caller, req.id);
    };

    const updateStrategyOnFeature = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string,
        payload: IFeatureStrategyPayload,
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'updateStrategyOnFeature',
        );
        await makeRequest(req.caller, req.id);

        if (
            addEditStrategyEnabled &&
            payload.constraints &&
            payload.constraints.length > 0
        ) {
            addToRecentlyUsedConstraints(payload.constraints);
        }
    };

    const setStrategiesSortOrder = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        payload: IFeatureStrategySortOrder[],
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/set-sort-order`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'setStrategiesSortOrderOnFeature',
        );
        await makeRequest(req.caller, req.id);
    };

    const setStrategyDisabledState = async (
        projectId: string,
        featureId: string,
        environmentId: string,
        strategyId: string,
        disabled: boolean,
    ): Promise<void> => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            {
                method: 'PATCH',
                body: JSON.stringify([
                    {
                        path: '/disabled',
                        value: disabled,
                        op: 'replace',
                    },
                ]),
            },
            'setStrategyDisabledState',
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        addStrategyToFeature,
        updateStrategyOnFeature,
        deleteStrategyFromFeature,
        setStrategiesSortOrder,
        setStrategyDisabledState,
        loading,
        errors,
    };
};

export default useFeatureStrategyApi;
