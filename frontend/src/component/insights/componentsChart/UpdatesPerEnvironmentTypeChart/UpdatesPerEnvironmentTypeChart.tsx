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
import { UpdatesPerEnvironmentTypeChartTooltip } from './UpdatesPerEnvironmentTypeChartTooltip/UpdatesPerEnvironmentTypeChartTooltip';

interface IUpdatesPerEnvironmnetTypeChart {
    environmentTypeTrends: InstanceInsightsSchema['environmentTypeTrends'];
    isLoading?: boolean;
}

const groupByDate = (
    items: InstanceInsightsSchemaEnvironmentTypeTrendsItem[],
): Record<string, InstanceInsightsSchemaEnvironmentTypeTrendsItem[]> => {
    if (!items) {
        return {};
    }

    const grouped = items.reduce(
        (acc, item) => {
            const key = item.environmentType;

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key].push(item);

            return acc;
        },
        {} as Record<string, InstanceInsightsSchemaEnvironmentTypeTrendsItem[]>,
    );

    return grouped;
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
    const notEnoughData = environmentTypeTrends?.length < 2;
    const placeholderData = usePlaceholderData({ fill: true, type: 'double' });

    const data = useMemo(() => {
        const grouped = groupByDate(environmentTypeTrends);
        const datasets = Object.entries(grouped).map(
            ([environmentType, trends]) => {
                const color = getEnvironmentTypeColor(environmentType);
                return {
                    label: environmentType,
                    data: trends,
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
