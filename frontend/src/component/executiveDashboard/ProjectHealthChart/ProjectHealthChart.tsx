import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';
import { LineChart } from '../LineChart/LineChart';
import { getRandomColor } from '../executive-dashboard-utils';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

export const ProjectHealthChart: VFC<IFlagsProjectChartProps> = ({
    projectFlagTrends,
}) => {
    const theme = useTheme();

    const data = useMemo(() => {
        const groupedFlagTrends = projectFlagTrends.reduce<
            Record<string, ExecutiveSummarySchemaProjectFlagTrendsItem[]>
        >((groups, item) => {
            if (!groups[item.project]) {
                groups[item.project] = [];
            }
            groups[item.project].push(item);
            return groups;
        }, {});

        const datasets = Object.entries(groupedFlagTrends).map(
            ([project, trends]) => {
                const color = getRandomColor();
                return {
                    label: project,
                    data: trends.map((item) => item.health || 0),
                    borderColor: color,
                    backgroundColor: color,
                    fill: true,
                };
            },
        );

        return {
            labels: projectFlagTrends.map((item) => item.date),
            datasets,
        };
    }, [theme, projectFlagTrends]);

    return <LineChart data={data} />;
};
