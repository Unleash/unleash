import { Tooltip } from '@material-ui/core';
import { useParams } from 'react-router';
import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import useToast from '../../../../../hooks/useToast';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import FeatureOverviewEnvSwitch from './FeatureOverviewEnvSwitch/FeatureOverviewEnvSwitch';
import { useStyles } from './FeatureOverviewEnvSwitches.styles';

const FeatureOverviewEnvSwitches = () => {
    const styles = useStyles();
    const { featureId, projectId } = useParams<IFeatureViewParams>();
    useFeatureApi();
    const { feature } = useFeature(projectId, featureId);
    const { toast, setToastData } = useToast();

    const renderEnvironmentSwitches = () => {
        return feature?.environments.map(env => {
            return (
                <FeatureOverviewEnvSwitch
                    key={env.name}
                    env={env}
                    setToastData={setToastData}
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
                    Toggle status
                </h3>
            </Tooltip>
            {renderEnvironmentSwitches()}
            {toast}
        </div>
    );
};

export default FeatureOverviewEnvSwitches;
