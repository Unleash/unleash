import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import useTheme from '@mui/material/styles/useTheme';
import { type FC, useEffect, useMemo, useState } from 'react';
import { Box, type Theme, styled } from '@mui/material';
import { FeatureMetricsHours } from '../feature/FeatureView/FeatureMetrics/FeatureMetricsHours/FeatureMetricsHours';
import GeneralSelect from '../common/GeneralSelect/GeneralSelect';
import { useFeatureMetricsRaw } from 'hooks/api/getters/useFeatureMetricsRaw/useFeatureMetricsRaw';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { createChartData } from './createChartData';
import { aggregateFeatureMetrics } from '../feature/FeatureView/FeatureMetrics/aggregateFeatureMetrics';
import {
    createBarChartOptions,
    createPlaceholderBarChartOptions,
} from './createChartOptions';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FlagExposure } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FlagExposure';
import useLoading from 'hooks/useLoading';

const defaultYes = [0, 14, 28, 21, 33, 31, 31, 22, 26, 37, 31, 14, 21, 14, 0];

const placeholderData = (theme: Theme, label?: string) => ({
    labels: Array.from({ length: 15 }, (_, i) => i + 1),
    datasets: [
        {
            data: defaultYes,
            backgroundColor: theme.palette.divider,
            hoverBackgroundColor: theme.palette.divider,
            label:
                label ||
                'No metrics for this feature flag in the selected environment and time period',
        },
    ],
});

const ChartWrapper = styled('div')({
    width: '90%',
});

export const PlaceholderFlagMetricsChart: React.FC<{ label?: string }> = ({
    label,
}) => {
    const theme = useTheme();

    const options = useMemo(() => {
        return createPlaceholderBarChartOptions(theme);
    }, [theme]);

    const data = useMemo(() => {
        return placeholderData(theme, label);
    }, [theme]);

    return (
        <ChartWrapper>
            <Bar
                data={data}
                options={options}
                aria-label='A placeholder bar chart with a single feature flag exposure metrics'
            />
        </ChartWrapper>
    );
};

export const EmptyFlagMetricsChart = () => {
    const theme = useTheme();

    const options = useMemo(() => {
        return createPlaceholderBarChartOptions(theme);
    }, [theme]);

    const data = useMemo(() => {
        return {
            labels: [],
            datasets: [],
        };
    }, [theme]);

    return (
        <ChartWrapper>
            <Bar
                data={data}
                options={options}
                aria-label='A placeholder bar chart with a single feature flag exposure metrics'
            />
        </ChartWrapper>
    );
};

const useMetricsEnvironments = (project: string, flagName: string) => {
    const [environment, setEnvironment] = useState<string | null>(null);
    const { feature } = useFeature(project, flagName);
    const activeEnvironments = feature.environments.map((env) => ({
        name: env.name,
        type: env.type,
    }));
    const firstProductionEnvironment = activeEnvironments.find(
        (env) => env.type === 'production',
    );

    useEffect(() => {
        if (firstProductionEnvironment) {
            setEnvironment(firstProductionEnvironment.name);
        } else if (activeEnvironments.length > 0) {
            setEnvironment(activeEnvironments[0].name);
        }
    }, [flagName, JSON.stringify(activeEnvironments)]);

    return { environment, setEnvironment, activeEnvironments };
};

const useFlagMetrics = (
    flagName: string,
    environment: string | null,
    hoursBack: number,
) => {
    const { featureMetrics: metrics = [], loading } = useFeatureMetricsRaw(
        flagName,
        hoursBack,
    );
    const sortedMetrics = useMemo(() => {
        return [...metrics].sort((metricA, metricB) => {
            return metricA.timestamp.localeCompare(metricB.timestamp);
        });
    }, [metrics]);
    const filteredMetrics = useMemo(() => {
        return aggregateFeatureMetrics(
            sortedMetrics?.filter(
                (metric) => environment === metric.environment,
            ),
        ).map((metric) => ({
            ...metric,
            appName: 'all selected',
        }));
    }, [sortedMetrics, environment]);

    const data = useMemo(() => {
        return createChartData(filteredMetrics);
    }, [filteredMetrics]);

    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const options = useMemo(() => {
        return createBarChartOptions(theme, hoursBack, locationSettings);
    }, [theme, hoursBack, locationSettings]);

    return { data, options, loading };
};

const EnvironmentSelect: FC<{
    activeEnvironments: { name: string }[];
    environment: string;
    setEnvironment: (environment: string | null) => void;
}> = ({ activeEnvironments, environment, setEnvironment }) => {
    return (
        <GeneralSelect
            name='feature-environments'
            label='Environment'
            id='feature-environments'
            options={activeEnvironments.map((env) => ({
                key: env.name,
                label: env.name,
            }))}
            value={String(environment)}
            onChange={setEnvironment}
        />
    );
};

const MetricsSelectors = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

const ChartContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
}));

const StyledExposure = styled(FlagExposure)({
    alignItems: 'center',
    justifySelf: 'start',
});

const ExposureAndMetricsRow = styled('div')({
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    width: '100%',
});

export const FlagMetricsChart: FC<{
    flag: { name: string; project: string };
    onArchive: () => void;
}> = ({ flag, onArchive }) => {
    const [hoursBack, setHoursBack] = useState(48);

    const { environment, setEnvironment, activeEnvironments } =
        useMetricsEnvironments(flag.project, flag.name);

    const { data, options, loading } = useFlagMetrics(
        flag.name,
        environment,
        hoursBack,
    );

    const noData = data.datasets[0].data.length === 0;

    console.log('loading', loading);
    const ref = useLoading(loading);

    return (
        <ChartContainer>
            <ExposureAndMetricsRow>
                <StyledExposure
                    project={flag.project}
                    flagName={flag.name}
                    onArchive={onArchive}
                />
                <MetricsSelectors>
                    {environment ? (
                        <EnvironmentSelect
                            environment={environment}
                            setEnvironment={setEnvironment}
                            activeEnvironments={activeEnvironments}
                        />
                    ) : null}
                    <FeatureMetricsHours
                        hoursBack={hoursBack}
                        setHoursBack={setHoursBack}
                    />
                </MetricsSelectors>
            </ExposureAndMetricsRow>

            {loading ? (
                <EmptyFlagMetricsChart />
            ) : noData ? (
                <PlaceholderFlagMetricsChart />
            ) : (
                <ChartWrapper>
                    <Bar
                        data={data}
                        options={options}
                        aria-label='A bar chart with a single feature flag exposure metrics'
                    />
                </ChartWrapper>
            )}
        </ChartContainer>
    );
};

ChartJS.register(
    annotationPlugin,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);
