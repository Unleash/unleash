import { useFeatureMetricsRaw } from 'hooks/api/getters/useFeatureMetricsRaw/useFeatureMetricsRaw';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useEffect, useMemo, useState } from 'react';
import {
    FEATURE_METRIC_HOURS_BACK_DEFAULT,
    FeatureMetricsHours,
} from './FeatureMetricsHours/FeatureMetricsHours';
import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { Grid } from '@mui/material';
import { FeatureMetricsContent } from './FeatureMetricsContent/FeatureMetricsContent';
import { FeatureMetricsChips } from './FeatureMetricsChips/FeatureMetricsChips';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import {
    ArrayParam,
    NumberParam,
    StringParam,
    useQueryParams,
    withDefault,
} from 'use-query-params';
import { aggregateFeatureMetrics } from './aggregateFeatureMetrics';

export const FeatureMetrics = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environments = useFeatureMetricsEnvironments(projectId, featureId);

    usePageTitle('Metrics');

    const defaultEnvironment = Array.from(environments)[0];

    const [query, setQuery] = useQueryParams({
        environment: withDefault(StringParam, defaultEnvironment),
        applications: withDefault(ArrayParam, []),
        hoursBack: withDefault(NumberParam, FEATURE_METRIC_HOURS_BACK_DEFAULT),
    });
    const applications = useFeatureMetricsApplications(
        featureId,
        query.hoursBack || FEATURE_METRIC_HOURS_BACK_DEFAULT,
    );
    const defaultApplication = Array.from(applications)[0];

    const { environment: selectedEnvironment, hoursBack } = query;
    const selectedApplications = query.applications.filter(
        (item) => item !== null,
    ) as string[];
    useEffect(() => {
        if (
            query.applications &&
            query.applications.length === 0 &&
            defaultApplication
        ) {
            setQuery({ applications: [defaultApplication] });
        }
    }, [JSON.stringify(Array.from(applications))]);

    const allSelected = [...applications].every((element) =>
        selectedApplications.includes(element),
    );

    const { featureMetrics } = useFeatureMetricsRaw(featureId, hoursBack);

    // Keep a cache of the fetched metrics so that we can
    // show the cached result while fetching new metrics.
    const [cachedMetrics, setCachedMetrics] = useState<
        Readonly<IFeatureMetricsRaw[]> | undefined
    >(featureMetrics);

    useEffect(() => {
        featureMetrics && setCachedMetrics(featureMetrics);
    }, [featureMetrics]);

    const filteredMetrics = useMemo(() => {
        return aggregateFeatureMetrics(
            cachedMetrics
                ?.filter((metric) => selectedEnvironment === metric.environment)
                .filter((metric) =>
                    selectedApplications.includes(metric.appName),
                ) || [],
        ).map((metric) => ({
            ...metric,
            appName:
                selectedApplications.length > 1
                    ? 'all selected'
                    : metric.appName,
            selectedApplications,
        }));
    }, [
        cachedMetrics,
        selectedEnvironment,
        JSON.stringify(selectedApplications),
    ]);

    if (!filteredMetrics) {
        return null;
    }

    return (
        <PageContent>
            <Grid container component='header' spacing={2}>
                <Grid item xs={12} md={5}>
                    <ConditionallyRender
                        condition={environments.size > 0}
                        show={
                            <FeatureMetricsChips
                                title='Environments'
                                values={environments}
                                selectedValues={[selectedEnvironment]}
                                toggleValue={(value) => {
                                    setQuery({ environment: value });
                                }}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} md={5}>
                    <ConditionallyRender
                        condition={applications.size > 0}
                        show={
                            <FeatureMetricsChips
                                title='Applications'
                                values={applications}
                                selectedValues={selectedApplications}
                                toggleValues={() => {
                                    if (allSelected) {
                                        setQuery({
                                            applications: [defaultApplication],
                                        });
                                    } else {
                                        setQuery({
                                            applications: [...applications],
                                        });
                                    }
                                }}
                                toggleValue={(value) => {
                                    if (selectedApplications.includes(value)) {
                                        setQuery({
                                            applications:
                                                selectedApplications.filter(
                                                    (app) => app !== value,
                                                ),
                                        });
                                    } else {
                                        setQuery({
                                            applications: [
                                                ...selectedApplications,
                                                value,
                                            ],
                                        });
                                    }
                                }}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} md={2}>
                    <FeatureMetricsHours
                        hoursBack={hoursBack}
                        setHoursBack={(value) => setQuery({ hoursBack: value })}
                    />
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
    featureId: string,
): Set<string> => {
    const { feature } = useFeature(projectId, featureId);

    const environments = feature.environments.map((environment) => {
        return environment.name;
    });

    return new Set(environments);
};

// Get all application names for a feature. Respect current hoursBack since
// we can have different apps in hourly time spans and daily time spans
const useFeatureMetricsApplications = (
    featureId: string,
    hoursBack = FEATURE_METRIC_HOURS_BACK_DEFAULT,
): Set<string> => {
    const { featureMetrics = [] } = useFeatureMetricsRaw(featureId, hoursBack);

    const applications = featureMetrics.map((metric) => {
        return metric.appName;
    });

    return new Set(applications);
};
