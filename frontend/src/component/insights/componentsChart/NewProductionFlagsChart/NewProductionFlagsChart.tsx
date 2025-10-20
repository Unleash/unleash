import 'chartjs-adapter-date-fns';
import type { FC } from 'react';
import {
    LineChart,
    NotEnoughData,
} from 'component/insights/components/LineChart/LineChart';
import { useBatchedTooltipDate } from '../useBatchedTooltipDate.ts';
import type { WeekData } from './types.ts';
import type { ChartData } from '../chartData.ts';

interface INewProductionFlagsChartProps {
    chartData: ChartData<WeekData, number>;
}

const useOverrideOptions = (chartData: ChartData<WeekData, number>) => {
    const batchedTooltipTitle = useBatchedTooltipDate();
    const sharedOptions = {
        parsing: {
            yAxisKey: 'newProductionFlags',
            xAxisKey: 'date',
        },
    };
    switch (chartData.state) {
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
    chartData,
}) => {
    const overrideOptions = useOverrideOptions(chartData);

    return (
        <LineChart
            data={chartData.value}
            overrideOptions={overrideOptions}
            cover={
                chartData.state === 'Not Enough Data' ? (
                    <NotEnoughData />
                ) : (
                    chartData.state === 'Loading'
                )
            }
        />
    );
};
