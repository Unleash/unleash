import { useParams } from 'react-router';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureMetrics.styles';
import { IFeatureViewParams } from '../../../../interfaces/params';
import useFeatureMetrics from '../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import FeatureEnvironmentMetrics from '../FeatureOverview/FeatureEnvironmentMetrics/FeatureEnvironmentMetrics';
import FeatureSeenApplications from '../FeatureSeenApplications/FeatureSeenApplications';
import PageContent from '../../../common/PageContent';

const emptyMetric = (environment: string) => ({
    yes: 0,
    no: 0,
    environment,
    timestamp: '',
});

const FeatureMetrics = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const styles = useStyles();

    const featureMetrics = feature?.environments.map(env => {
        const envMetric = metrics.lastHourUsage.find(
            metric => metric.environment === env.name
        );
        return envMetric || emptyMetric(env.name);
    });

    const metricComponents = featureMetrics.map(metric => {
        return (
            <FeatureEnvironmentMetrics
                key={metric.environment}
                className={styles.environmentMetrics}
                metric={metric}
            />
        );
    });

    return (
        <>
            <PageContent headerContent="Environment metrics">
                <div className={styles.environmentContainer}>
                    {metricComponents}
                </div>
            </PageContent>

            <PageContent
                headerContent="Applications"
                className={styles.secondaryContent}
            >
                <div className={styles.applicationsContainer}>
                    <FeatureSeenApplications />
                </div>
            </PageContent>
        </>
    );
};

export default FeatureMetrics;
