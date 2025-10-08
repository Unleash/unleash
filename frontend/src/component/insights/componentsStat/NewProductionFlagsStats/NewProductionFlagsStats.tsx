import type { FC } from 'react';
import { StatCard } from '../shared/StatCard.tsx';
import type { ChartDataState } from 'component/insights/componentsChart/chartDataState.ts';

interface NewProductionFlagsStatsProps {
    median: number | string;
    isLoading?: boolean;
    chartDataResult: ChartDataState;
}

export const NewProductionFlagsStats: FC<NewProductionFlagsStatsProps> = ({
    median,
    chartDataResult,
}) => {
    const label =
        chartDataResult.status === 'Batched'
            ? `Median per ${chartDataResult.batchSize} weeks`
            : 'Median per week';
    const isLoading = chartDataResult.status === 'Loading';

    return (
        <StatCard
            value={median}
            label={label}
            tooltip='The median number of flags that have entered production for the selected time range.'
            explanation='How often do flags go live in production?'
            isLoading={isLoading}
        />
    );
};
