import { Add } from '@material-ui/icons';
import { Link, useParams } from 'react-router-dom';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import ResponsiveButton from '../../../../common/ResponsiveButton/ResponsiveButton';
import FeatureOverviewEnvironment from './FeatureOverviewEnvironment/FeatureOverviewEnvironment';
import { useStyles } from './FeatureOverviewStrategies.styles';

const FeatureOverviewStrategies = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature, refetch } = useFeature(projectId, featureId);

    if (!feature) return null;

    const { environments } = feature;

    const renderEnvironments = () => {
        return environments?.map(env => {
            return (
                <FeatureOverviewEnvironment
                    env={env}
                    key={env.name}
                    refetch={refetch}
                />
            );
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <div className={styles.headerInnerContainer}>
                    <h3 className={styles.headerTitle}>Toggle Strategies</h3>
                    <div className={styles.actions}>
                        <ResponsiveButton
                            maxWidth="700px"
                            Icon={Add}
                            className={styles.addStrategyButton}
                            component={Link}
                            to={`/projects/${projectId}/features2/${featureId}/strategies?addStrategy=true`}
                        >
                            Add new strategy
                        </ResponsiveButton>
                    </div>
                </div>
            </div>

            <div className={styles.bodyContainer}>{renderEnvironments()}</div>
        </div>
    );
};

export default FeatureOverviewStrategies;
