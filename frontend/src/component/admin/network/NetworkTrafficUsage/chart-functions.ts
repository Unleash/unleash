import type { ChartDataset } from 'chart.js';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';
import { endpointsInfo } from './endpoint-info';
import type { SegmentedSchemaApiData } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
} from 'date-fns';
import { formatDay, formatMonth } from './dates';
import type { ChartDataSelection } from './chart-data-selection';
export type ChartDatasetType = ChartDataset<'bar'>;

// todo: test
export const toChartData = (
    traffic?: TrafficUsageDataSegmentedCombinedSchema,
): { datasets: ChartDatasetType[]; labels: (string | number)[] } => {
    if (!traffic) {
        return { labels: [], datasets: [] };
    }

    if (traffic.grouping === 'monthly') {
        return toMonthlyChartData(traffic);
    } else {
        return toDailyChartData(traffic);
    }
};

// todo: integrate filtering `filterData` frontend/src/component/admin/network/NetworkTrafficUsage/util.ts
const prepareApiData = (
    apiData: TrafficUsageDataSegmentedCombinedSchema['apiData'],
) =>
    apiData
        .filter((item) => item.apiPath in endpointsInfo)
        .sort(
            (item1: SegmentedSchemaApiData, item2: SegmentedSchemaApiData) =>
                endpointsInfo[item1.apiPath].order -
                endpointsInfo[item2.apiPath].order,
        );

const toMonthlyChartData = (
    traffic: TrafficUsageDataSegmentedCombinedSchema,
): { datasets: ChartDatasetType[]; labels: string[] } => {
    const from = new Date(traffic.dateRange.from);
    const to = new Date(traffic.dateRange.to);
    const numMonths = Math.abs(differenceInCalendarMonths(to, from)) + 1;

    const datasets = prepareApiData(traffic.apiData).map(
        (item: SegmentedSchemaApiData) => {
            const monthsRec: { [month: string]: number } = {};
            for (let i = 0; i < numMonths; i++) {
                monthsRec[formatMonth(addMonths(from, i))] = 0;
            }

            for (const month of Object.values(item.dataPoints)) {
                monthsRec[month.period] = month.trafficTypes[0].count;
            }

            const epInfo = endpointsInfo[item.apiPath];

            return {
                label: epInfo.label,
                data: Object.values(monthsRec),
                backgroundColor: epInfo.color,
                hoverBackgroundColor: epInfo.color,
            };
        },
    );

    const labels = Array.from({ length: numMonths }).map((_, index) =>
        index === numMonths - 1
            ? 'Current month'
            : formatMonth(addMonths(from, index)),
    );

    return { datasets, labels };
};

const toDailyChartData = (
    traffic: TrafficUsageDataSegmentedCombinedSchema,
): { datasets: ChartDatasetType[]; labels: number[] } => {
    const from = new Date(traffic.dateRange.from);
    const to = new Date(traffic.dateRange.to);
    const numDays = Math.abs(differenceInCalendarDays(to, from)) + 1;

    const daysRec: { [day: string]: number } = {};
    for (let i = 0; i < numDays; i++) {
        daysRec[formatDay(addDays(from, i))] = 0;
    }

    const getDaysRec = () => ({
        ...daysRec,
    });

    const datasets = prepareApiData(traffic.apiData).map(
        (item: SegmentedSchemaApiData) => {
            const daysRec = getDaysRec();

            for (const day of Object.values(item.dataPoints)) {
                daysRec[day.period] = day.trafficTypes[0].count;
            }

            const epInfo = endpointsInfo[item.apiPath];

            return {
                label: epInfo.label,
                data: Object.values(daysRec),
                backgroundColor: epInfo.color,
                hoverBackgroundColor: epInfo.color,
            };
        },
    );

    // simplification: assuming days run in a single month from the 1st onwards
    const labels = Array.from({ length: numDays }).map((_, index) => index + 1);

    return { datasets, labels };
};

const [lastLabel, ...otherLabels] = Object.values(endpointsInfo)
    .map((info) => info.label.toLowerCase())
    .toReversed();
const requestTypes = `${otherLabels.toReversed().join(', ')}, and ${lastLabel}`;

export const getChartLabel = (selectedPeriod: ChartDataSelection) =>
    selectedPeriod.grouping === 'daily'
        ? `A bar chart showing daily traffic usage for ${new Date(
              selectedPeriod.month,
          ).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
          })}. Each date shows ${requestTypes} requests.`
        : `A bar chart showing monthly total traffic usage for the current month and the preceding ${selectedPeriod.monthsBack} months. Each month shows ${requestTypes} requests.`;
