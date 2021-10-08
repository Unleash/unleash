import { Button, useMediaQuery } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useContext, useState } from 'react';
import { getHumanReadbleStrategyName } from '../../../../../../utils/strategy-names';
import { useHistory, useParams } from 'react-router-dom';

import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import FeatureStrategyAccordion from '../../FeatureStrategyAccordion/FeatureStrategyAccordion';
import useFeatureStrategyApi from '../../../../../../hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';

import { useStyles } from './FeatureStrategiesConfigure.styles';
import FeatureStrategiesProductionGuard from '../FeatureStrategiesProductionGuard/FeatureStrategiesProductionGuard';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import cloneDeep from 'lodash.clonedeep';
import FeatureStrategyCreateExecution from '../../FeatureStrategyCreateExecution/FeatureStrategyCreateExecution';
import { PRODUCTION } from '../../../../../../constants/environmentTypes';
import { ADD_NEW_STRATEGY_SAVE_ID } from '../../../../../../testIds';
import useFeature from '../../../../../../hooks/api/getters/useFeature/useFeature';

interface IFeatureStrategiesConfigure {
    setToastData: React.Dispatch<React.SetStateAction<IToastType>>;
}
const FeatureStrategiesConfigure = ({
    setToastData,
}: IFeatureStrategiesConfigure) => {
    const smallScreen = useMediaQuery('(max-width:900px)');
    const history = useHistory();

    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { refetch } = useFeature(projectId, featureId);

    const [productionGuard, setProductionGuard] = useState(false);

    const styles = useStyles();
    const {
        activeEnvironment,
        setConfigureNewStrategy,
        configureNewStrategy,
        setExpandedSidebar,
        featureCache,
        setFeatureCache,
    } = useContext(FeatureStrategiesUIContext);

    const [strategyConstraints, setStrategyConstraints] = useState(
        configureNewStrategy.constraints
    );
    const [strategyParams, setStrategyParams] = useState(
        configureNewStrategy.parameters
    );
    const { addStrategyToFeature, loading } = useFeatureStrategyApi();

    const handleCancel = () => {
        setConfigureNewStrategy(null);
        setExpandedSidebar(true);
    };

    const resolveSubmit = () => {
        if (activeEnvironment.type === PRODUCTION) {
            setProductionGuard(true);
            return;
        }
        handleSubmit();
    };

    const handleSubmit = async () => {
        const strategyPayload = {
            ...configureNewStrategy,
            constraints: strategyConstraints,
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
                env => env.name === activeEnvironment.name
            );

            environment.strategies.push(strategy);
            setFeatureCache(feature);

            setConfigureNewStrategy(null);
            setExpandedSidebar(false);
            setToastData({
                show: true,
                type: 'success',
                text: 'Successfully added strategy.',
            });
            history.replace(history.location.pathname);
            refetch();
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>
                Configuring{' '}
                {getHumanReadbleStrategyName(configureNewStrategy.name)} in{' '}
                {activeEnvironment.name}
            </h2>
            <ConditionallyRender
                condition={activeEnvironment.enabled}
                show={
                    <Alert severity="warning" className={styles.envWarning}>
                        This environment is currently enabled. The strategy will
                        take effect immediately after you save your changes.
                    </Alert>
                }
                elseShow={
                    <Alert severity="warning" className={styles.envWarning}>
                        This environment is currently disabled. The strategy
                        will not take effect before you enable the environment
                        on the feature toggle.
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
                        constraints={strategyConstraints}
                        setStrategyParams={setStrategyParams}
                        setStrategyConstraints={setStrategyConstraints}
                    />
                </div>

                <ConditionallyRender
                    condition={!smallScreen}
                    show={
                        <div className={styles.executionContainer}>
                            <FeatureStrategyCreateExecution
                                parameters={strategyParams}
                                constraints={strategyConstraints}
                                configureNewStrategy={configureNewStrategy}
                            />
                        </div>
                    }
                />
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
