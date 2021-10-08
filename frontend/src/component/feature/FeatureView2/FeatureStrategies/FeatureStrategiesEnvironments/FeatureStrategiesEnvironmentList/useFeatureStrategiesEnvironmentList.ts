import { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import useFeatureStrategyApi from '../../../../../../hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from '../../../../../../hooks/useToast';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import { IFeatureStrategy } from '../../../../../../interfaces/strategy';
import cloneDeep from 'lodash.clonedeep';

const useFeatureStrategiesEnvironmentList = (
    strategies: IFeatureStrategy[]
) => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const history = useHistory();
    const { deleteStrategyFromFeature, updateStrategyOnFeature } =
        useFeatureStrategyApi();

    const {
        setConfigureNewStrategy,
        configureNewStrategy,
        activeEnvironment,
        setExpandedSidebar,
        expandedSidebar,
        setFeatureCache,
        featureCache,
    } = useContext(FeatureStrategiesUIContext);

    const { toast, setToastData } = useToast();
    const [delDialog, setDelDialog] = useState({ strategyId: '', show: false });
    const [productionGuard, setProductionGuard] = useState({
        show: false,
        strategyId: '',
    });

    const activeEnvironmentsRef = useRef(null);

    useEffect(() => {
        activeEnvironmentsRef.current = activeEnvironment;
    }, [activeEnvironment]);

    const updateStrategy = async (updatedStrategy: IFeatureStrategy) => {
        try {
            const updateStrategyPayload: IStrategyPayload = {
                constraints: updatedStrategy.constraints,
                parameters: updatedStrategy.parameters,
            };

            await updateStrategyOnFeature(
                projectId,
                featureId,
                activeEnvironment.name,
                updatedStrategy.id,
                updateStrategyPayload
            );

            setToastData({
                show: true,
                type: 'success',
                text: `Successfully updated strategy`,
            });

            const feature = cloneDeep(featureCache);

            const environment = feature.environments.find(
                env => env.name === activeEnvironment.name
            );

            const strategy = environment.strategies.find(
                strategy => strategy.id === updatedStrategy.id
            );

            strategy.parameters = updateStrategyPayload.parameters;
            strategy.constraints = updateStrategyPayload.constraints;
            history.replace(history.location.pathname);
            setFeatureCache(feature);
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    const deleteStrategy = async (strategyId: string) => {
        try {
            const environmentId = activeEnvironment.name;
            await deleteStrategyFromFeature(
                projectId,
                featureId,
                environmentId,
                strategyId
            );

            const feature = cloneDeep(featureCache);
            const environment = feature.environments.find(
                env => env.name === environmentId
            );
            const strategyIdx = environment.strategies.findIndex(
                strategy => strategy.id === strategyId
            );

            environment.strategies.splice(strategyIdx, 1);
            setFeatureCache(feature);

            setDelDialog({ strategyId: '', show: false });
            setToastData({
                show: true,
                type: 'success',
                text: `Successfully deleted strategy from ${featureId}`,
            });
            history.replace(history.location.pathname);
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    return {
        activeEnvironmentsRef,
        toast,
        deleteStrategy,
        updateStrategy,
        delDialog,
        setDelDialog,
        setProductionGuard,
        productionGuard,
        setConfigureNewStrategy,
        configureNewStrategy,
        setExpandedSidebar,
        expandedSidebar,
        featureId,
        activeEnvironment,
    };
};

export default useFeatureStrategiesEnvironmentList;
