import useFeatureMetrics from '../../../../hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../interfaces/params';
import React from 'react';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import FeatureEnvironmentMetrics from '../FeatureOverview/FeatureEnvironmentMetrics/FeatureEnvironmentMetrics';
import FeatureSeenApplications from '../FeatureSeenApplications/FeatureSeenApplications';
import { Grid } from '@material-ui/core';

const emptyMetric = (environment: string) => ({
    yes: 0,
    no: 0,
    environment,
    timestamp: '',
});
const EnvironmentMetricComponent: React.FC = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const { metrics } = useFeatureMetrics(projectId, featureId);

    const featureMetrics = feature?.environments.map(env => {
        const envMetric = metrics.lastHourUsage.find(
            metric => metric.environment === env.name
        );
        return envMetric || emptyMetric(env.name);
    });

    const metricComponents = featureMetrics.map(metric => {
        return (
            <Grid item sm={4}>
                <FeatureEnvironmentMetrics key={metric.environment} metric={metric} />
            </Grid>)
    })
    return (
        <>
            <Grid container data-loading spacing={1}>
                <Grid item xs={12}>
                <h2>{'Environments'}</h2>
                <hr />
                </Grid>
                {metricComponents}
            </Grid>
            <Grid container data-loading>
                <h2>Applications</h2>
                <hr />
                <FeatureSeenApplications />
            </Grid>
        </>
    );
};

export default EnvironmentMetricComponent;
