import type { FC } from 'react';
import { StatCard } from '../shared/StatCard.tsx';
import type { ChartData } from 'component/insights/componentsChart/chartData.ts';

interface NewProductionFlagsStatsProps {
    median: number | string;
    chartData: ChartData<unknown, unknown>;
}

export const NewProductionFlagsStats: FC<NewProductionFlagsStatsProps> = ({
    median,
    chartData,
}) => {
    const label =
        chartData.state === 'Batched'
            ? `Median per ${chartData.batchSize} weeks`
            : 'Median per week';

    return (
        <StatCard
            value={median}
            label={label}
            tooltip='The median number of flags that have entered production for the selected time range.'
            explanation='How often do flags go live in production?'
            isLoading={chartData.state === 'Loading'}
        />
    );
};
