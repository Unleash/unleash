import useFeatureMetrics from '../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../interfaces/params';
import React from 'react';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import FeatureEnvironmentMetrics from '../FeatureOverview/FeatureEnvironmentMetrics/FeatureEnvironmentMetrics';
import FeatureSeenApplications from '../FeatureSeenApplications/FeatureSeenApplications';
import { useStyles } from './EnvironmentMetricComponent.style';

const emptyMetric = (environment: string) => ({
    yes: 0,
    no: 0,
    environment,
    timestamp: ''
});
const EnvironmentMetricComponent: React.FC = () => {
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
            <FeatureEnvironmentMetrics key={metric.environment} metric={metric} />
        );
    });

    return (
        <>
            <div className={styles.environmentHeader}>Environments</div>
            <div className={styles.environmentContainer}>
                {metricComponents}
            </div>
            <div className={styles.applicationHeader}>Applications</div>
            <div className={styles.applicationsContainer}>
                <FeatureSeenApplications />
            </div>
        </>
    )
        ;
};

export default EnvironmentMetricComponent;
