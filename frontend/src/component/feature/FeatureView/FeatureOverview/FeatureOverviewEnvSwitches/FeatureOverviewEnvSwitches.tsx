import { Tooltip } from '@material-ui/core';
import { useState } from 'react';
import { useParams } from 'react-router';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from 'interfaces/params';
import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import FeatureOverviewEnvSwitch from './FeatureOverviewEnvSwitch/FeatureOverviewEnvSwitch';
import { useStyles } from './FeatureOverviewEnvSwitches.styles';

const FeatureOverviewEnvSwitches = () => {
    const styles = useStyles();
    const { featureId, projectId } = useParams<IFeatureViewParams>();
    useFeatureApi();
    const { feature } = useFeature(projectId, featureId);

    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    const closeInfoBox = () => {
        setShowInfoBox(false);
    };

    const renderEnvironmentSwitches = () => {
        return feature?.environments.map(env => {
            return (
                <FeatureOverviewEnvSwitch
                    key={env.name}
                    env={env}
                    showInfoBox={() => {
                        setEnvironmentName(env.name);
                        setShowInfoBox(true);
                    }}
                />
            );
        });
    };

    return (
        <div className={styles.container}>
            <Tooltip
                arrow
                title="Environments can be switched off for a single toggle. Resulting in all calls towards the toggle to return false."
            >
                <h3 className={styles.header} data-loading>
                    Feature toggle status
                </h3>
            </Tooltip>
            {renderEnvironmentSwitches()}
            <EnvironmentStrategyDialog
                open={showInfoBox}
                onClose={closeInfoBox}
                projectId={projectId}
                featureId={featureId}
                environmentName={environmentName}
            />
        </div>
    );
};

export default FeatureOverviewEnvSwitches;
