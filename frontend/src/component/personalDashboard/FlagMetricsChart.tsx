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
import { Box, styled } from '@mui/material';
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

const defaultYes = [0, 14, 28, 21, 33, 31, 31, 22, 26, 37, 31, 14, 21, 14, 0];

const placeholderData = {
    labels: Array.from({ length: 15 }, (_, i) => i + 1),
    datasets: [
        {
            data: defaultYes,
            backgroundColor: '#EAEAED',
            hoverBackgroundColor: '#EAEAED',
            label: 'No metrics for this feature flag in the selected environment and time period',
        },
    ],
};

const ChartWrapper = styled('div')({
    width: '90%',
});

export const PlaceholderFlagMetricsChart = () => {
    const theme = useTheme();

    const options = useMemo(() => {
        return createPlaceholderBarChartOptions(theme);
    }, [theme]);

    return (
        <ChartWrapper>
            <Bar
                data={placeholderData}
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
    const { featureMetrics: metrics = [] } = useFeatureMetricsRaw(
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

    return { data, options };
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

const ExposureAndSelectors = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    width: '100%',
}));

const ChartContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    alignItems: 'center',
}));

const StyledExposure = styled(FlagExposure)({
    alignItems: 'center',
});

export const FlagMetricsChart: FC<{
    flag: { name: string; project: string };
    onArchive: () => void;
}> = ({ flag, onArchive }) => {
    const [hoursBack, setHoursBack] = useState(48);

    const { environment, setEnvironment, activeEnvironments } =
        useMetricsEnvironments(flag.project, flag.name);

    const { data, options } = useFlagMetrics(flag.name, environment, hoursBack);

    const noData = data.datasets[0].data.length === 0;

    return (
        <ChartContainer>
            <ExposureAndSelectors>
                <StyledExposure
                    showTimeAgo
                    project={flag.project}
                    flagName={flag.name}
                    onArchive={onArchive}
                />
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
            </ExposureAndSelectors>

            {noData ? (
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
