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
import { Box, styled, Typography } from '@mui/material';
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
import { customHighlightPlugin } from '../common/Chart/customHighlightPlugin';

const defaultYes = [
    45_000_000, 28_000_000, 28_000_000, 25_000_000, 50_000_000, 27_000_000,
    26_000_000, 50_000_000, 32_000_000, 12_000_000, 13_000_000, 31_000_000,
    12_000_000, 47_000_000, 29_000_000, 46_000_000, 45_000_000, 28_000_000,
    28_000_000, 25_000_000, 50_000_000, 27_000_000, 26_000_000, 50_000_000,
    32_000_000, 12_000_000, 13_000_000, 31_000_000, 12_000_000, 47_000_000,
];
const defaultNo = [
    5_000_000, 8_000_000, 3_000_000, 2_000_000, 2_000_000, 5_000_000, 9_000_000,
    3_000_000, 7_000_000, 2_000_000, 5_000_000, 8_000_000, 3_000_000, 2_000_000,
    2_000_000, 5_000_000, 1_000_000, 3_000_000, 12_000_000, 2_000_000,
    1_000_000, 1_000_000, 3_000_000, 2_000_000, 2_000_000, 5_000_000, 1_000_000,
    3_000_000, 8_000_000, 2_000_000,
];

const placeholderData = {
    labels: Array.from({ length: 30 }, (_, i) => i + 1),
    datasets: [
        {
            data: defaultYes,
            label: 'yes',
            backgroundColor: '#BEBEBE',
            hoverBackgroundColor: '#BEBEBE',
        },
        {
            data: defaultNo,
            label: 'no',
            backgroundColor: '#9A9A9A',
            hoverBackgroundColor: '#9A9A9A',
        },
    ],
};

export const PlaceholderFlagMetricsChart = () => {
    const theme = useTheme();

    const options = useMemo(() => {
        return createPlaceholderBarChartOptions(theme);
    }, [theme]);

    return (
        <>
            <Typography sx={{ mb: 4 }}>Feature flag metrics</Typography>
            <Bar
                data={placeholderData}
                options={options}
                aria-label='A placeholder bar chart with a single feature flag exposure metrics'
            />
        </>
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
    mb: theme.spacing(6),
}));

export const FlagMetricsChart: FC<{
    flag: { name: string; project: string };
}> = ({ flag }) => {
    const [hoursBack, setHoursBack] = useState(48);

    const { environment, setEnvironment, activeEnvironments } =
        useMetricsEnvironments(flag.project, flag.name);

    const { data, options } = useFlagMetrics(flag.name, environment, hoursBack);

    return (
        <>
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
                    label={null}
                />
            </MetricsSelectors>

            <Bar
                data={data}
                plugins={[customHighlightPlugin(30, 0)]}
                options={options}
                aria-label='A bar chart with a single feature flag exposure metrics'
            />
        </>
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
