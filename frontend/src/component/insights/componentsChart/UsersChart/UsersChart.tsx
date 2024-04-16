import { useMemo, type VFC } from 'react';
import 'chartjs-adapter-date-fns';
import { useTheme } from '@mui/material';
import type { InstanceInsightsSchema } from 'openapi';
import {
    fillGradientPrimary,
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useUiFlag } from 'hooks/useUiFlag';
import { usePlaceholderData } from 'component/insights/hooks/usePlaceholderData';

interface IUsersChartProps {
    userTrends: InstanceInsightsSchema['userTrends'];
    isLoading?: boolean;
}

export const UsersChart: VFC<IUsersChartProps> = ({
    userTrends,
    isLoading,
}) => {
    const showInactiveUsers = useUiFlag('showInactiveUsers');
    const theme = useTheme();
    const notEnoughData = !isLoading && userTrends.length < 2;
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
                ...(showInactiveUsers
                    ? [
                          {
                              label: 'Active users',
                              data: userTrends.map((item) => item.active),
                              borderColor: theme.palette.success.border,
                              backgroundColor: theme.palette.success.border,
                              order: 2,
                          },
                          {
                              label: 'Inactive users',
                              data: userTrends.map((item) => item.inactive),
                              borderColor: theme.palette.warning.border,
                              backgroundColor: theme.palette.warning.border,
                              order: 1,
                          },
                      ]
                    : []),
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
