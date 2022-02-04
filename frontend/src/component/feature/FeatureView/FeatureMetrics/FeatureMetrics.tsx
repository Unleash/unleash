import { useParams } from 'react-router';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from '../../../../interfaces/params';
import useFeatureMetrics from '../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import FeatureEnvironmentMetrics from '../FeatureOverview/FeatureEnvironmentMetrics/FeatureEnvironmentMetrics';
import FeatureSeenApplications from '../FeatureSeenApplications/FeatureSeenApplications';
import PageContent from '../../../common/PageContent';

import { useStyles } from './FeatureMetrics.styles';
import { getFeatureMetrics } from '../../../../utils/get-feature-metrics';

const FeatureMetrics = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const styles = useStyles();

    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);

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
