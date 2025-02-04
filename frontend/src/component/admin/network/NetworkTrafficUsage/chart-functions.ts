import type { ChartDataset } from 'chart.js';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';
import { endpointsInfo } from './endpoint-info';
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
} from 'date-fns';
import { formatDay, formatMonth } from './dates';
import type { ChartDataSelection } from './chart-data-selection';
export type ChartDatasetType = ChartDataset<'bar'>;

export const toChartData = (
    traffic?: TrafficUsageDataSegmentedCombinedSchema,
): { datasets: ChartDatasetType[]; labels: string[] } => {
    if (!traffic) {
        return { labels: [], datasets: [] };
    }

    const { newRecord, labels } = getLabelsAndRecords(traffic);
    const datasets = traffic.apiData
        .sort(
            (item1, item2) =>
                endpointsInfo[item1.apiPath].order -
                endpointsInfo[item2.apiPath].order,
        )
        .map((item) => {
            const record = newRecord();
            for (const dataPoint of Object.values(item.dataPoints)) {
                record[dataPoint.period] = dataPoint.trafficTypes[0].count;
            }

            const epInfo = endpointsInfo[item.apiPath];

            return {
                label: epInfo.label,
                data: Object.values(record),
                backgroundColor: epInfo.color,
                hoverBackgroundColor: epInfo.color,
            };
        });

    return { datasets, labels };
};

const getLabelsAndRecords = (
    traffic: TrafficUsageDataSegmentedCombinedSchema,
) => {
    if (traffic.grouping === 'monthly') {
        const from = new Date(traffic.dateRange.from);
        const to = new Date(traffic.dateRange.to);
        const numMonths = Math.abs(differenceInCalendarMonths(to, from)) + 1;
        const monthsRec: { [month: string]: number } = {};
        for (let i = 0; i < numMonths; i++) {
            monthsRec[formatMonth(addMonths(from, i))] = 0;
        }

        const labels = Array.from({ length: numMonths }).map((_, index) =>
            index === numMonths - 1
                ? 'Current month'
                : formatMonth(addMonths(from, index)),
        );
        return { newRecord: () => ({ ...monthsRec }), labels };
    } else {
        const from = new Date(traffic.dateRange.from);
        const to = new Date(traffic.dateRange.to);
        const numDays = Math.abs(differenceInCalendarDays(to, from)) + 1;
        const daysRec: { [day: string]: number } = {};
        for (let i = 0; i < numDays; i++) {
            daysRec[formatDay(addDays(from, i))] = 0;
        }

        // simplification: the chart only allows for single, full-month views
        // when you use a daily chart, so just use the day of the month as the label
        const labels = Array.from({ length: numDays }).map((_, index) =>
            (index + 1).toString(),
        );

        return { newRecord: () => ({ ...daysRec }), labels };
    }
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
