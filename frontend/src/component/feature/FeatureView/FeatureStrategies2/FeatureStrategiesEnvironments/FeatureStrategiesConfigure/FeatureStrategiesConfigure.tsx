import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useContext, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import FeatureStrategyAccordion from '../../FeatureStrategyAccordion/FeatureStrategyAccordion';
import useFeatureStrategyApi from '../../../../../../hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';

import { useStyles } from './FeatureStrategiesConfigure.styles';
import FeatureStrategiesProductionGuard, {
    FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING,
} from '../FeatureStrategiesProductionGuard/FeatureStrategiesProductionGuard';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import cloneDeep from 'lodash.clonedeep';
import { PRODUCTION } from '../../../../../../constants/environmentTypes';
import { ADD_NEW_STRATEGY_SAVE_ID } from '../../../../../../testIds';
import useFeature from '../../../../../../hooks/api/getters/useFeature/useFeature';
import { scrollToTop } from '../../../../../common/util';
import useToast from '../../../../../../hooks/useToast';
import { IConstraint } from '../../../../../../interfaces/strategy';

const FeatureStrategiesConfigure = () => {
    const history = useHistory();
    const { setToastData, setToastApiError } = useToast();

    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { refetch } = useFeature(projectId, featureId);

    const [productionGuard, setProductionGuard] = useState(false);
    const dontShow = JSON.parse(
        localStorage.getItem(FEATURE_STRATEGY_PRODUCTION_GUARD_SETTING) ||
            'false'
    );
    const styles = useStyles();
    const {
        // @ts-expect-error
        activeEnvironment,
        // @ts-expect-error
        setConfigureNewStrategy,
        // @ts-expect-error
        configureNewStrategy,
        // @ts-expect-error
        setExpandedSidebar,
        // @ts-expect-error
        featureCache,
        // @ts-expect-error
        setFeatureCache,
    } = useContext(FeatureStrategiesUIContext);

    const mapConstraints = useCallback((constraint: IConstraint) => {
        return {
            constraint: {
                caseInsensitive: false,
                inverted: false,
                value: '',
                values: [],
                ...cloneDeep(constraint),
            },
            metadata: {},
        };
    }, []);

    const [localConstraints, setLocalConstraints] = useState(
        configureNewStrategy.constraints.map(mapConstraints)
    );

    const [strategyParams, setStrategyParams] = useState(
        configureNewStrategy.parameters
    );
    const { addStrategyToFeature, loading } = useFeatureStrategyApi();

    const setStrategyConstraints = (constraints: IConstraint[]) => {
        // @ts-expect-error
        setConfigureNewStrategy(prev => ({ ...prev, constraints }));
    };

    const handleCancel = () => {
        setConfigureNewStrategy(null);
        setExpandedSidebar(true);
    };

    const resolveSubmit = () => {
        if (activeEnvironment.type === PRODUCTION && !dontShow) {
            setProductionGuard(true);
            return;
        }
        handleSubmit();
    };

    const handleSubmit = async () => {
        const strategyPayload = {
            ...configureNewStrategy,
            constraints: localConstraints.map(
                // @ts-expect-error
                localConstraints => localConstraints.constraint
            ),
            parameters: strategyParams,
        };

        try {
            if (loading) return;
            const res = await addStrategyToFeature(
                projectId,
                featureId,
                activeEnvironment.name,
                strategyPayload
            );
            const strategy = await res.json();

            const feature = cloneDeep(featureCache);
            const environment = feature.environments.find(
                // @ts-expect-error
                env => env.name === activeEnvironment.name
            );

            environment.strategies.push(strategy);
            setFeatureCache(feature);

            setConfigureNewStrategy(null);
            setExpandedSidebar(false);
            setToastData({
                type: 'success',
                text: 'Successfully added strategy',
                title: 'Added strategy',
                confetti: true,
            });
            history.replace(history.location.pathname);
            refetch();
            scrollToTop();
        } catch (e) {
            // @ts-expect-error
            setToastApiError(e.message);
        }
    };

    return (
        <div className={styles.container}>
            <ConditionallyRender
                condition={activeEnvironment.enabled}
                show={
                    <Alert severity="warning" className={styles.envWarning}>
                        This toggle is currently enabled in this environment.
                        The strategy will take effect immediately after you save
                        your changes.
                    </Alert>
                }
            />

            <div className={styles.configureContainer}>
                <div className={styles.accordionContainer}>
                    <FeatureStrategyAccordion
                        strategy={configureNewStrategy}
                        expanded
                        hideActions
                        parameters={strategyParams}
                        localConstraints={localConstraints}
                        setLocalConstraints={setLocalConstraints}
                        // @ts-expect-error
                        setStrategyConstraints={setStrategyConstraints}
                        setStrategyParams={setStrategyParams}
                        create
                    />
                </div>
            </div>

            <div className={styles.buttonContainer}>
                <Button
                    variant="contained"
                    color="primary"
                    className={styles.btn}
                    onClick={resolveSubmit}
                    data-test={ADD_NEW_STRATEGY_SAVE_ID}
                    disabled={loading}
                >
                    Save
                </Button>
                <Button
                    className={styles.btn}
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </div>
            <FeatureStrategiesProductionGuard
                primaryButtonText="Save changes"
                loading={loading}
                show={productionGuard}
                onClick={() => {
                    handleSubmit();
                    setProductionGuard(false);
                }}
                onClose={() => setProductionGuard(false)}
            />
        </div>
    );
};

export default FeatureStrategiesConfigure;
