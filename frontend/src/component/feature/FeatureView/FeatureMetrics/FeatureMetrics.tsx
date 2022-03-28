import { useParams } from 'react-router';
import { IFeatureViewParams } from 'interfaces/params';
import { useFeatureMetricsRaw } from 'hooks/api/getters/useFeatureMetricsRaw/useFeatureMetricsRaw';
import PageContent from 'component/common/PageContent';
import { useEffect, useMemo, useState } from 'react';
import {
    FEATURE_METRIC_HOURS_BACK_MAX,
    FeatureMetricsHours,
} from './FeatureMetricsHours/FeatureMetricsHours';
import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { Grid } from '@material-ui/core';
import { FeatureMetricsContent } from './FeatureMetricsContent/FeatureMetricsContent';
import { useQueryStringNumberState } from 'hooks/useQueryStringNumberState';
import { useQueryStringState } from 'hooks/useQueryStringState';
import { FeatureMetricsChips } from './FeatureMetricsChips/FeatureMetricsChips';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { useStyles } from './FeatureMetrics.styles';

export const FeatureMetrics = () => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const environments = useFeatureMetricsEnvironments(projectId, featureId);
    const applications = useFeatureMetricsApplications(featureId);
    const styles = useStyles();

    const [hoursBack = FEATURE_METRIC_HOURS_BACK_MAX, setHoursBack] =
        useQueryStringNumberState('hoursBack');
    const { featureMetrics } = useFeatureMetricsRaw(featureId, hoursBack);

    // Keep a cache of the fetched metrics so that we can
    // show the cached result while fetching new metrics.
    const [cachedMetrics, setCachedMetrics] = useState<
        Readonly<IFeatureMetricsRaw[]> | undefined
    >(featureMetrics);

    useEffect(() => {
        featureMetrics && setCachedMetrics(featureMetrics);
    }, [featureMetrics]);

    const defaultEnvironment = Array.from(environments)[0];
    const defaultApplication = Array.from(applications)[0];
    const [environment = defaultEnvironment, setEnvironment] =
        useQueryStringState('environment');
    const [application = defaultApplication, setApplication] =
        useQueryStringState('application');

    const filteredMetrics = useMemo(() => {
        return cachedMetrics
            ?.filter(metric => metric.environment === environment)
            .filter(metric => metric.appName === application);
    }, [cachedMetrics, environment, application]);

    if (!filteredMetrics) {
        return null;
    }

    return (
        <PageContent headerContent="">
            <Grid
                container
                component="header"
                spacing={2}
                alignItems="flex-end"
            >
                <Grid item xs={12} md={5}>
                    <ConditionallyRender
                        condition={environments.size > 0}
                        show={
                            <FeatureMetricsChips
                                title="Environments"
                                values={environments}
                                value={environment}
                                setValue={setEnvironment}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} md={5}>
                    <ConditionallyRender
                        condition={applications.size > 0}
                        show={
                            <FeatureMetricsChips
                                title="Applications"
                                values={applications}
                                value={application}
                                setValue={setApplication}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} md={2}>
                    <div className={styles.mobileMarginTop}>
                        <FeatureMetricsHours
                            hoursBack={hoursBack}
                            setHoursBack={setHoursBack}
                        />
                    </div>
                </Grid>
            </Grid>
            <FeatureMetricsContent
                metrics={filteredMetrics}
                hoursBack={hoursBack}
            />
        </PageContent>
    );
};

// Get all the environment names for a feature,
// not just the one's we have metrics for.
const useFeatureMetricsEnvironments = (
    projectId: string,
    featureId: string
): Set<string> => {
    const { feature } = useFeature(projectId, featureId);

    const environments = feature.environments.map(environment => {
        return environment.name;
    });

    return new Set(environments);
};

// Get all application names for a feature. Fetch apps for the max time range
// so that the list of apps doesn't change when selecting a shorter range.
const useFeatureMetricsApplications = (featureId: string): Set<string> => {
    const { featureMetrics = [] } = useFeatureMetricsRaw(
        featureId,
        FEATURE_METRIC_HOURS_BACK_MAX
    );

    const applications = featureMetrics.map(metric => {
        return metric.appName;
    });

    return new Set(applications);
};

export default FeatureMetrics;
