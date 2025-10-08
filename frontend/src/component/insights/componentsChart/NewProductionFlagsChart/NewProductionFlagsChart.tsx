import 'chartjs-adapter-date-fns';
import { type FC, useId } from 'react';
import {
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useBatchedTooltipDate } from '../useBatchedTooltipDate.ts';
import type { ChartData } from 'chart.js';
import type { WeekData } from './types.ts';
import type { ChartDataState } from '../chartDataState.ts';

interface INewProductionFlagsChartProps {
    isLoading?: boolean;
    data: ChartData<'line', WeekData[] | number[]>;
    type: ChartDataState;
}

const useOverrideOptions = (chartDataResult: ChartDataState) => {
    const batchedTooltipTitle = useBatchedTooltipDate();
    const sharedOptions = {
        parsing: {
            yAxisKey: 'newProductionFlags',
            xAxisKey: 'date',
        },
    };
    switch (chartDataResult.status) {
        case 'Batched': {
            return {
                ...sharedOptions,
                scales: {
                    x: {
                        time: {
                            unit: 'month' as const,
                            tooltipFormat: 'P',
                        },
                        ticks: {
                            source: 'auto' as const,
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: batchedTooltipTitle,
                        },
                    },
                },
            };
        }
        case 'Weekly':
            return sharedOptions;
        case 'Not Enough Data':
        case 'Loading':
            return {};
    }
};

export const NewProductionFlagsChart: FC<INewProductionFlagsChartProps> = ({
    data,
    type,
}) => {
    const key = useId();
    const overrideOptions = useOverrideOptions(type);
    const isLoading = type.status === 'Loading';

    return (
        <LineChart
            key={key}
            data={data}
            overrideOptions={overrideOptions}
            cover={
                type.status === 'Not Enough Data' ? (
                    <NotEnoughData />
                ) : (
                    isLoading
                )
            }
        />
    );
};
