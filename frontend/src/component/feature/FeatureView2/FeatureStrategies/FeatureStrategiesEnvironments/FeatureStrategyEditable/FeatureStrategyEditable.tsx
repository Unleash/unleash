import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { mutate } from 'swr';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import useFeatureStrategy from '../../../../../../hooks/api/getters/useFeatureStrategy/useFeatureStrategy';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import {
    IConstraint,
    IParameter,
    IFeatureStrategy,
} from '../../../../../../interfaces/strategy';
import FeatureStrategyAccordion from '../../FeatureStrategyAccordion/FeatureStrategyAccordion';
import cloneDeep from 'lodash.clonedeep';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureStrategyEditable.styles';
import { Delete } from '@material-ui/icons';
import { PRODUCTION } from '../../../../../../constants/environmentTypes';
import {
    DELETE_STRATEGY_ID,
    STRATEGY_ACCORDION_ID,
    UPDATE_STRATEGY_BUTTON_ID,
} from '../../../../../../testIds';
import AccessContext from '../../../../../../contexts/AccessContext';
import { UPDATE_FEATURE } from '../../../../../AccessProvider/permissions';

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
    const { hasAccess } = useContext(AccessContext);

    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { activeEnvironment, featureCache, dirty, setDirty } = useContext(
        FeatureStrategiesUIContext
    );
    const [strategyCache, setStrategyCache] = useState<IFeatureStrategy | null>(
        null
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
        setDirty(prev => ({ ...prev, [strategy.id]: dirtyParams }));
    };

    const updateFeatureStrategy = () => {
        const cleanup = () => {
            setStrategyCache(cloneDeep(strategy));
            setDirty(prev => ({ ...prev, [strategy.id]: false }));
        };

        updateStrategy(strategy, cleanup);

        if (activeEnvironment.type !== PRODUCTION) {
            cleanup();
        }
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
        mutate(FEATURE_STRATEGY_CACHE_KEY, { ...strategyCache }, false);
        setDirty(prev => ({ ...prev, [strategy.id]: false }));
    };

    const setStrategyConstraints = (constraints: IConstraint[]) => {
        const updatedStrategy = { ...strategy };
        updatedStrategy.constraints = constraints;
        mutate(FEATURE_STRATEGY_CACHE_KEY, { ...updatedStrategy }, false);
        setDirty(prev => ({ ...prev, [strategy.id]: true }));
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
                constraints={constraints}
                data-test={`${STRATEGY_ACCORDION_ID}-${strategy.name}`}
                strategy={strategy}
                setStrategyParams={setStrategyParams}
                setStrategyConstraints={setStrategyConstraints}
                dirty={dirty[strategy.id]}
                actions={
                    <ConditionallyRender
                        condition={hasAccess(UPDATE_FEATURE)}
                        show={
                            <Tooltip title="Delete strategy">
                                <IconButton
                                    data-test={`${DELETE_STRATEGY_ID}-${strategy.name}`}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setDelDialog({
                                            strategyId: strategy.id,
                                            show: true,
                                        });
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                }
            >
                <ConditionallyRender
                    condition={dirty[strategy.id]}
                    show={
                        <>
                            <div className={styles.buttonContainer}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className={styles.editButton}
                                    onClick={updateFeatureStrategy}
                                    data-test={UPDATE_STRATEGY_BUTTON_ID}
                                >
                                    Save changes
                                </Button>
                                <Button
                                    onClick={discardChanges}
                                    className={styles.editButton}
                                >
                                    Discard changes
                                </Button>
                            </div>
                        </>
                    }
                />
            </FeatureStrategyAccordion>
        </div>
    );
};

export default FeatureStrategyEditable;
