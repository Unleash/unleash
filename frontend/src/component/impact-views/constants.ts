import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { ISelectOption } from 'component/common/GeneralSelect/GeneralSelect';

export const TIME_RANGE_LABELS: Record<ChartTimeRange, string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
    threeMonths: 'Last 3 months',
    sixMonths: 'Last 6 months',
};

export const TIME_RANGE_OPTIONS: ISelectOption[] = Object.entries(
    TIME_RANGE_LABELS,
).map(([key, label]) => ({ key, label }));
