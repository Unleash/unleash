import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaEnvironmentTypeTrendsItem,
} from 'openapi';
import { LineChart, NotEnoughData } from '../../components/LineChart/LineChart';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';

interface IUpdatesPerEnvironmnetTypeChart {
    environmentTypeTrends: ExecutiveSummarySchema['environmentTypeTrends'];
    isLoading?: boolean;
}

const groupByDate = (
    items: ExecutiveSummarySchemaEnvironmentTypeTrendsItem[],
): Record<string, ExecutiveSummarySchemaEnvironmentTypeTrendsItem[]> => {
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
        {} as Record<string, ExecutiveSummarySchemaEnvironmentTypeTrendsItem[]>,
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
        const labels = environmentTypeTrends?.map((item) => item.date);
        const datasets = Object.entries(grouped).map(
            ([environmentType, trends]) => {
                const color = getEnvironmentTypeColor(environmentType);
                return {
                    label: environmentType,
                    data: trends.map((item) => item.totalUpdates),
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                };
            },
        );
        return { labels, datasets };
    }, [theme, environmentTypeTrends]);

    return (
        <LineChart
            data={notEnoughData || isLoading ? placeholderData : data}
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
