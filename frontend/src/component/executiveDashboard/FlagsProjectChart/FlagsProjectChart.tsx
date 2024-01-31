import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';
import { LineChart } from '../LineChart/LineChart';

interface IFlagsProjectChartProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const FlagsProjectChart: VFC<IFlagsProjectChartProps> = ({
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
                    data: trends.map((item) => item.total),
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
