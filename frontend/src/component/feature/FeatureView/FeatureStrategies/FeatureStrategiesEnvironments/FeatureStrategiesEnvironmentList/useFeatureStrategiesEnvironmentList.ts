import { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import useFeatureStrategyApi from '../../../../../../hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from '../../../../../../hooks/useToast';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import {
    IFeatureStrategy,
    IStrategyPayload,
} from '../../../../../../interfaces/strategy';
import cloneDeep from 'lodash.clonedeep';
import { IFeatureEnvironment } from '../../../../../../interfaces/featureToggle';
import { formatUnknownError } from '../../../../../../utils/format-unknown-error';

const useFeatureStrategiesEnvironmentList = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const history = useHistory();
    const { deleteStrategyFromFeature, updateStrategyOnFeature } =
        useFeatureStrategyApi();

    const {
        // @ts-expect-error
        setConfigureNewStrategy,
        // @ts-expect-error
        configureNewStrategy,
        // @ts-expect-error
        activeEnvironment,
        // @ts-expect-error
        setExpandedSidebar,
        // @ts-expect-error
        expandedSidebar,
        // @ts-expect-error
        setFeatureCache,
        // @ts-expect-error
        featureCache,
    } = useContext(FeatureStrategiesUIContext);

    const { setToastData, setToastApiError } = useToast();
    const [delDialog, setDelDialog] = useState({ strategyId: '', show: false });
    const [productionGuard, setProductionGuard] = useState({
        show: false,
        strategyId: '',
    });

    const activeEnvironmentsRef = useRef(null);

    useEffect(() => {
        activeEnvironmentsRef.current = activeEnvironment;
    }, [activeEnvironment]);

    const updateFeatureEnvironmentCache = () => {
        const feature = cloneDeep(featureCache);

        const environment = feature.environments.find(
            (env: IFeatureEnvironment) => env.name === activeEnvironment.name
        );

        environment.enabled = !environment.enabled;

        setFeatureCache(feature);
    };

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
                title: 'Updates strategy',
                confetti: true,
                type: 'success',
                text: `Successfully updated strategy`,
            });

            const feature = cloneDeep(featureCache);

            const environment = feature.environments.find(
                // @ts-expect-error
                env => env.name === activeEnvironment.name
            );

            const strategy = environment.strategies.find(
                // @ts-expect-error
                strategy => strategy.id === updatedStrategy.id
            );

            strategy.parameters = updateStrategyPayload.parameters;
            strategy.constraints = updateStrategyPayload.constraints;
            history.replace(history.location.pathname);
            setFeatureCache(feature);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
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
                // @ts-expect-error
                env => env.name === environmentId
            );
            const strategyIdx = environment.strategies.findIndex(
                // @ts-expect-error
                strategy => strategy.id === strategyId
            );

            environment.strategies.splice(strategyIdx, 1);
            setFeatureCache(feature);

            setDelDialog({ strategyId: '', show: false });
            setToastData({
                type: 'success',
                title: 'Deleted strategy',
                text: `Successfully deleted strategy from ${featureId}`,
            });
            history.replace(history.location.pathname);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return {
        activeEnvironmentsRef,
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
        updateFeatureEnvironmentCache,
    };
};

export default useFeatureStrategiesEnvironmentList;
