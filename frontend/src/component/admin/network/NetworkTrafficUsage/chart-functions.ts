import type { ChartDataset } from 'chart.js';
import type {
    MeteredConnectionsSchema,
    MeteredRequestsSchema,
    TrafficUsageDataSegmentedCombinedSchema,
} from 'openapi';
import { endpointsInfo } from './endpoint-info.js';
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
} from 'date-fns';
import { formatDay, formatMonth, parseDateString } from './dates.js';
import type { ChartDataSelection } from './chart-data-selection.js';
export type ChartDatasetType = ChartDataset<'bar'>;

export const toTrafficUsageChartData = (
    traffic: TrafficUsageDataSegmentedCombinedSchema,
    filter?: string,
): { datasets: ChartDatasetType[]; labels: string[] } => {
    const { newRecord, labels } = getLabelsAndRecords(traffic);
    const datasets = traffic.apiData
        .filter((apiData) => (filter ? apiData.apiPath === filter : true))
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

export const toConnectionChartData = (
    traffic: MeteredConnectionsSchema,
): { datasets: ChartDatasetType[]; labels: string[] } => {
    const { newRecord, labels } = getLabelsAndRecords(traffic);
    const datasets = traffic.apiData.map((item) => {
        const record = newRecord();
        for (const dataPoint of Object.values(item.dataPoints)) {
            const requestCount = dataPoint.connections;
            record[dataPoint.period] = requestCount;
        }

        const epInfo = {
            label: 'Connections',
            color: '#6D66D9',
            order: 1,
        };

        return {
            label: epInfo.label,
            data: Object.values(record),
            backgroundColor: epInfo.color,
            hoverBackgroundColor: epInfo.color,
        };
    });

    return { datasets, labels };
};

export const toRequestChartData = (
    traffic: MeteredRequestsSchema,
): { datasets: ChartDatasetType[]; labels: string[] } => {
    const { newRecord, labels } = getLabelsAndRecords(traffic);
    const datasets = traffic.apiData.map((item) => {
        const record = newRecord();
        for (const dataPoint of Object.values(item.dataPoints)) {
            const requestCount = dataPoint.requests;
            record[dataPoint.period] = requestCount;
        }

        const epInfo = {
            label: 'Frontend requests',
            color: '#A39EFF',
            order: 1,
        };

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
    traffic: Pick<
        TrafficUsageDataSegmentedCombinedSchema,
        'dateRange' | 'grouping'
    >,
) => {
    if (traffic.grouping === 'monthly') {
        const from = parseDateString(traffic.dateRange.from);
        const to = parseDateString(traffic.dateRange.to);
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
        const from = parseDateString(traffic.dateRange.from);
        const to = parseDateString(traffic.dateRange.to);
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
