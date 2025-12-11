import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import type {
    InstanceInsightsSchema,
    InstanceInsightsSchemaEnvironmentTypeTrendsItem,
} from 'openapi';
import {
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';
import { UpdatesPerEnvironmentTypeChartTooltip } from './UpdatesPerEnvironmentTypeChartTooltip/UpdatesPerEnvironmentTypeChartTooltip.tsx';

interface IUpdatesPerEnvironmnetTypeChart {
    environmentTypeTrends: InstanceInsightsSchema['environmentTypeTrends'];
    isLoading?: boolean;
}

export const groupByDateAndFillMissingDatapoints = (
    items: InstanceInsightsSchemaEnvironmentTypeTrendsItem[],
): Record<string, InstanceInsightsSchemaEnvironmentTypeTrendsItem[]> => {
    if (!items.length) {
        return {};
    }

    const initialGrouping: Record<
        string,
        InstanceInsightsSchemaEnvironmentTypeTrendsItem[]
    > = {};
    for (const item of items) {
        if (!initialGrouping[item.date]) {
            initialGrouping[item.date] = [];
        }
        initialGrouping[item.date].push(item);
    }

    const allEnvironmentTypes = Array.from(
        new Set(items.map((item) => item.environmentType)),
    );

    const finalGrouping: Record<
        string,
        InstanceInsightsSchemaEnvironmentTypeTrendsItem[]
    > = {};
    Object.entries(initialGrouping).forEach(([date, environmentItems]) => {
        const fullSetForDate = allEnvironmentTypes.map((envType) => {
            const existingItem = environmentItems.find(
                (item) => item.environmentType === envType,
            );
            if (existingItem) {
                return existingItem;
            } else {
                const week =
                    items.find((item) => item.date === date)?.week || '';
                return {
                    date,
                    environmentType: envType,
                    totalUpdates: 0,
                    week,
                };
            }
        });

        finalGrouping[date] = fullSetForDate;
    });

    return finalGrouping;
};

const useEnvironmentTypeColor = () => {
    const theme = useTheme();

    return (environmentType: string) => {
        switch (environmentType) {
            case 'production':
                return theme.palette.charts.series[3];
            case 'staging':
                return theme.palette.charts.series[1];
            case 'development':
                return theme.palette.charts.series[0];
            case 'test':
                return theme.palette.charts.series[2];
            default:
                return theme.palette.charts.series[4];
        }
    };
};

export const UpdatesPerEnvironmentTypeChart: VFC<
    IUpdatesPerEnvironmnetTypeChart
> = ({ environmentTypeTrends, isLoading }) => {
    const theme = useTheme();
    const getEnvironmentTypeColor = useEnvironmentTypeColor();
    const notEnoughData = !isLoading && environmentTypeTrends?.length < 2;
    const placeholderData = usePlaceholderData({ fill: true, type: 'double' });

    const data = useMemo(() => {
        const groupedByDate = groupByDateAndFillMissingDatapoints(
            environmentTypeTrends,
        );

        const aggregatedByType: Record<
            string,
            InstanceInsightsSchemaEnvironmentTypeTrendsItem[]
        > = {};

        Object.entries(groupedByDate).forEach(([_date, trends]) => {
            trends.forEach((trend) => {
                if (!aggregatedByType[trend.environmentType]) {
                    aggregatedByType[trend.environmentType] = [];
                }
                // Add an object that includes the date and totalUpdates for that environmentType
                aggregatedByType[trend.environmentType].push(trend);
            });
        });

        const datasets = Object.entries(aggregatedByType).map(
            ([environmentType, dataPoints]) => {
                const color = getEnvironmentTypeColor(environmentType);
                return {
                    label: environmentType,
                    data: dataPoints,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                };
            },
        );

        return { datasets };
    }, [theme, environmentTypeTrends]);

    return (
        <LineChart
            data={notEnoughData || isLoading ? placeholderData : data}
            overrideOptions={
                notEnoughData
                    ? {}
                    : {
                          parsing: {
                              yAxisKey: 'totalUpdates',
                              xAxisKey: 'date',
                          },
                      }
            }
            TooltipComponent={UpdatesPerEnvironmentTypeChartTooltip}
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
