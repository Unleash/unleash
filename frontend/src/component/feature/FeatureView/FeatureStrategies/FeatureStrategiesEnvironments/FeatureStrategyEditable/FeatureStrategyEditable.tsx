import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mutate } from 'swr';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import useFeatureStrategy from '../../../../../../hooks/api/getters/useFeatureStrategy/useFeatureStrategy';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import {
    IConstraint,
    IFeatureStrategy,
    IParameter,
} from '../../../../../../interfaces/strategy';
import FeatureStrategyAccordion from '../../FeatureStrategyAccordion/FeatureStrategyAccordion';
import cloneDeep from 'lodash.clonedeep';
import { Tooltip } from '@material-ui/core';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureStrategyEditable.styles';
import { Delete } from '@material-ui/icons';
import {
    DELETE_STRATEGY_ID,
    STRATEGY_ACCORDION_ID,
    UPDATE_STRATEGY_BUTTON_ID,
} from '../../../../../../testIds';
import {
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
} from '../../../../../providers/AccessProvider/permissions';
import useFeatureApi from '../../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import PermissionIconButton from '../../../../../common/PermissionIconButton/PermissionIconButton';
import PermissionButton from '../../../../../common/PermissionButton/PermissionButton';

interface IFeatureStrategyEditable {
    currentStrategy: IFeatureStrategy;
    setDelDialog?: React.Dispatch<React.SetStateAction<any>>;
    updateStrategy: (strategy: IFeatureStrategy) => void;
    index?: number;
}

const FeatureStrategyEditable = ({
    currentStrategy,
    updateStrategy,
    setDelDialog,
    index,
}: IFeatureStrategyEditable) => {
    const { loading } = useFeatureApi();

    const { projectId, featureId } = useParams<IFeatureViewParams>();
    // @ts-expect-error
    const { activeEnvironment, featureCache, dirty, setDirty } = useContext(
        FeatureStrategiesUIContext
    );
    const [strategyCache, setStrategyCache] = useState<IFeatureStrategy>(
        cloneDeep(currentStrategy)
    );
    const styles = useStyles();

    const { strategy, FEATURE_STRATEGY_CACHE_KEY } = useFeatureStrategy(
        projectId,
        featureId,
        activeEnvironment.name,
        currentStrategy.id,
        {
            revalidateOnMount: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            revalidateOnFocus: false,
        }
    );

    const setStrategyParams = (parameters: IParameter) => {
        const updatedStrategy = { ...strategy };
        updatedStrategy.parameters = parameters;
        mutate(FEATURE_STRATEGY_CACHE_KEY, { ...updatedStrategy }, false);

        const dirtyParams = isDirtyParams(parameters);
        // @ts-expect-error
        setDirty(prev => ({ ...prev, [strategy.id]: dirtyParams }));
    };

    const updateFeatureStrategy = () => {
        const cleanup = () => {
            setStrategyCache(cloneDeep(strategy));
            // @ts-expect-error
            setDirty(prev => ({ ...prev, [strategy.id]: false }));
        };

        // @ts-expect-error
        updateStrategy(strategy, cleanup);
    };

    useEffect(() => {
        const dirtyStrategy = dirty[strategy.id];
        if (dirtyStrategy) return;
        mutate(FEATURE_STRATEGY_CACHE_KEY, { ...currentStrategy }, false);
        setStrategyCache(cloneDeep(currentStrategy));
        /* eslint-disable-next-line */
    }, [featureCache]);

    const isDirtyParams = (parameters: IParameter) => {
        const initialParams = strategyCache?.parameters;

        if (!initialParams || !parameters) return false;

        const keys = Object.keys(initialParams);

        const dirty = keys.some(key => {
            const old = initialParams[key];
            const current = parameters[key];

            return old !== current;
        });

        return dirty;
    };

    const discardChanges = () => {
        // @ts-expect-error
        setDirty(prev => ({ ...prev, [strategy.id]: false }));
        mutate(FEATURE_STRATEGY_CACHE_KEY, { ...strategyCache }, false);
    };

    const setStrategyConstraints = (constraints: IConstraint[]) => {
        const updatedStrategy = cloneDeep(strategy);

        updatedStrategy.constraints = [...cloneDeep(constraints)];
        // @ts-expect-error
        setDirty(prev => ({ ...prev, [strategy.id]: true }));
        mutate(FEATURE_STRATEGY_CACHE_KEY, { ...updatedStrategy }, false);
    };

    if (!strategy.id) return null;
    const { parameters, constraints } = strategy;

    return (
        <div className={styles.editableContainer}>
            <ConditionallyRender
                condition={dirty[strategy.id]}
                show={<div className={styles.unsaved}>Unsaved changes</div>}
            />
            <FeatureStrategyAccordion
                parameters={parameters}
                constraints={cloneDeep(constraints)}
                data-test={`${STRATEGY_ACCORDION_ID}-${strategy.name}`}
                strategy={strategy}
                setStrategyParams={setStrategyParams}
                // @ts-expect-error
                setStrategyConstraints={setStrategyConstraints}
                dirty={dirty[strategy.id]}
                actions={
                    <Tooltip title="Delete strategy">
                        <PermissionIconButton
                            permission={DELETE_FEATURE_STRATEGY}
                            projectId={projectId}
                            environmentId={activeEnvironment.name}
                            data-test={`${DELETE_STRATEGY_ID}-${strategy.name}`}
                            onClick={e => {
                                e.stopPropagation();
                                // @ts-expect-error
                                setDelDialog({
                                    strategyId: strategy.id,
                                    show: true,
                                });
                            }}
                        >
                            <Delete />
                        </PermissionIconButton>
                    </Tooltip>
                }
            >
                <ConditionallyRender
                    condition={dirty[strategy.id]}
                    show={
                        <>
                            <div className={styles.buttonContainer}>
                                <PermissionButton
                                    permission={UPDATE_FEATURE_STRATEGY}
                                    projectId={projectId}
                                    environmentId={activeEnvironment?.name}
                                    variant="contained"
                                    color="primary"
                                    className={styles.editButton}
                                    onClick={updateFeatureStrategy}
                                    data-test={UPDATE_STRATEGY_BUTTON_ID}
                                    disabled={loading}
                                >
                                    Save changes
                                </PermissionButton>
                                <PermissionButton
                                    onClick={discardChanges}
                                    className={styles.editButton}
                                    disabled={loading}
                                    // @ts-expect-error
                                    color="tertiary"
                                    variant="text"
                                    permission={UPDATE_FEATURE_STRATEGY}
                                    projectId={projectId}
                                    environmentId={activeEnvironment?.name}
                                >
                                    Discard changes
                                </PermissionButton>
                            </div>
                        </>
                    }
                />
            </FeatureStrategyAccordion>
        </div>
    );
};

export default FeatureStrategyEditable;
