import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import { ExecutiveSummarySchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from '../../components/LineChart/LineChart';
import { usePlaceholderData } from 'component/executiveDashboard/hooks/usePlaceholderData';

interface IUsersChartProps {
    userTrends: ExecutiveSummarySchema['userTrends'];
    isLoading?: boolean;
}

export const UsersChart: VFC<IUsersChartProps> = ({
    userTrends,
    isLoading,
}) => {
    const theme = useTheme();
    const notEnoughData = userTrends.length < 2;
    const placeholderData = usePlaceholderData({ fill: true, type: 'rising' });
    const data = useMemo(
        () => ({
            labels: userTrends.map((item) => item.date),
            datasets: [
                {
                    label: 'Total users',
                    data: userTrends.map((item) => item.total),
                    borderColor: theme.palette.primary.light,
                    backgroundColor: fillGradientPrimary,
                    pointBackgroundColor: theme.palette.primary.main,
                    fill: true,
                    order: 3,
                },
                ...([]),
            ],
        }),
        [theme, userTrends],
    );

    return (
        <LineChart
            data={notEnoughData || isLoading ? placeholderData : data}
            cover={notEnoughData ? <NotEnoughData /> : isLoading}
        />
    );
};
