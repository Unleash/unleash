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
import { Box, type Theme, styled, Typography } from '@mui/material';
import { FeatureMetricsHours } from '../feature/FeatureView/FeatureMetrics/FeatureMetricsHours/FeatureMetricsHours.tsx';
import GeneralSelect from '../common/GeneralSelect/GeneralSelect.tsx';
import { useFeatureMetricsRaw } from 'hooks/api/getters/useFeatureMetricsRaw/useFeatureMetricsRaw';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { createChartData } from './createChartData.ts';
import { aggregateFeatureMetrics } from '../feature/FeatureView/FeatureMetrics/aggregateFeatureMetrics.ts';
import {
    createBarChartOptions,
    createPlaceholderBarChartOptions,
} from './createChartOptions.ts';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FlagExposure } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FlagExposure';

const defaultYes = [0, 14, 28, 21, 33, 31, 31, 22, 26, 37, 31, 14, 21, 14, 0];

const placeholderData = (theme: Theme) => ({
    labels: Array.from({ length: 15 }, (_, i) => i + 1),
    datasets: [
        {
            data: defaultYes,
            backgroundColor: theme.palette.divider,
            hoverBackgroundColor: theme.palette.divider,
            label: '',
        },
    ],
});

const ChartWrapper = styled('div')({
    width: '100%',
    flexGrow: 1,
});

const PlaceholderFlagMetricsChart: React.FC<{ label: string }> = ({
    label,
}) => {
    const theme = useTheme();

    const options = useMemo(() => {
        return createPlaceholderBarChartOptions(theme);
    }, [theme]);

    const data = useMemo(() => {
        return placeholderData(theme);
    }, [theme]);

    const labelId = 'placeholder-chart-label';

    return (
        <>
            <Typography id={labelId}>{label}</Typography>
            <ChartWrapper>
                <Bar data={data} options={options} aria-describedby={labelId} />
            </ChartWrapper>
        </>
    );
};

const EmptyFlagMetricsChart = () => {
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
    const activeEnvironments = (feature?.environments ?? []).map((env) => ({
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
    const {
        featureMetrics: metrics = [],
        loading,
        error,
    } = useFeatureMetricsRaw(flagName, hoursBack);

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

    return { data, options, loading, error };
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
    justifyContent: 'flex-start',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
}));

const ChartContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
}));

const StyledExposure = styled(FlagExposure)({
    alignItems: 'center',
    justifySelf: 'start',
});

const ExposureAndMetricsRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    width: '100%',
    gap: theme.spacing(4),
}));

export const PlaceholderFlagMetricsChartWithWrapper: React.FC<{
    label: string;
}> = (props) => {
    return (
        <ChartContainer>
            <PlaceholderFlagMetricsChart {...props} />
        </ChartContainer>
    );
};

const FlagMetricsChartInner: FC<{
    flag: { name: string; project: string };
    onArchive: () => void;
}> = ({ flag, onArchive }) => {
    const [hoursBack, setHoursBack] = useState(48);

    const { environment, setEnvironment, activeEnvironments } =
        useMetricsEnvironments(flag.project, flag.name);

    const {
        data,
        options,
        loading,
        error: metricsError,
    } = useFlagMetrics(flag.name, environment, hoursBack);

    if (metricsError) {
        return (
            <ChartContainer>
                <PlaceholderFlagMetricsChart
                    label={`Couldn't fetch metrics for the current flag right now. Please try again. Report this if it doesn't resolve itself.`}
                />
            </ChartContainer>
        );
    }

    const noData = data.datasets[0].data.length === 0;

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
                <PlaceholderFlagMetricsChart label='No metrics for this feature flag in the selected environment and time period' />
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

export const FlagMetricsChart: FC<{
    flag: { name: string; project: string };
    onArchive: () => void;
}> = (props) => {
    const breakingNames = ['.', '..'];
    if (breakingNames.includes(props.flag.name)) {
        return (
            <ChartContainer>
                <PlaceholderFlagMetricsChart
                    label={`The current flag name ('${props.flag.name}') is known to cause issues due how it affects URLs. We cannot show you a chart for it.`}
                />
            </ChartContainer>
        );
    }

    return <FlagMetricsChartInner {...props} />;
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
