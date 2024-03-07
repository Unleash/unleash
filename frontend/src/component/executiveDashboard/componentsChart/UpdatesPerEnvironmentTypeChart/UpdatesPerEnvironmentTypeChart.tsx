import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaEnvironmentTypeTrendsItem,
} from 'openapi';
import { LineChart, NotEnoughData } from '../../components/LineChart/LineChart';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';
import { getProjectColor } from '../../executive-dashboard-utils';

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

export const UpdatesPerEnvironmentTypeChart: VFC<
    IUpdatesPerEnvironmnetTypeChart
> = ({ environmentTypeTrends, isLoading }) => {
    const theme = useTheme();
    const notEnoughData = environmentTypeTrends?.length < 2;
    const placeholderData = usePlaceholderData({ fill: true, type: 'double' });

    const data = useMemo(() => {
        const grouped = groupByDate(environmentTypeTrends);
        const labels = environmentTypeTrends?.map((item) => item.date);
        const datasets = Object.entries(grouped).map(
            ([environmentType, trends]) => {
                const color = getProjectColor(environmentType);
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
