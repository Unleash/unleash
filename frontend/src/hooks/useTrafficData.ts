import { useState } from 'react';
import type {
    IInstanceTrafficMetricsResponse,
    SegmentedSchema,
    SegmentedSchemaApiData,
} from './api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import type { ChartDataset } from 'chart.js';
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    format,
} from 'date-fns';

const DEFAULT_TRAFFIC_DATA_UNIT_COST = 5;
const DEFAULT_TRAFFIC_DATA_UNIT_SIZE = 1_000_000;

export type SelectablePeriod = {
    key: string;
    dayCount: number;
    label: string;
    year: number;
    month: number;
};

export type EndpointInfo = {
    label: string;
    color: string;
    order: number;
};

export type ChartDatasetType = ChartDataset<'bar'>;

const endpointsInfo: Record<string, EndpointInfo> = {
    '/api/admin': {
        label: 'Admin',
        color: '#6D66D9',
        order: 1,
    },
    '/api/frontend': {
        label: 'Frontend',
        color: '#A39EFF',
        order: 2,
    },
    '/api/client': {
        label: 'Server',
        color: '#D8D6FF',
        order: 3,
    },
};

const calculateTrafficDataCost = (
    trafficData: number,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
) => {
    const unitCount = Math.ceil(trafficData / trafficUnitSize);
    return unitCount * trafficUnitCost;
};

const padMonth = (month: number): string => month.toString().padStart(2, '0');

export const toSelectablePeriod = (
    date: Date,
    label?: string,
): SelectablePeriod => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const period = `${year}-${padMonth(month + 1)}`;
    const dayCount = new Date(year, month + 1, 0).getDate();
    return {
        key: period,
        year,
        month,
        dayCount,
        label:
            label ||
            date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    };
};

const currentDate = new Date(Date.now());
const currentPeriod = toSelectablePeriod(currentDate, 'Current month');

const getSelectablePeriods = (): SelectablePeriod[] => {
    const selectablePeriods = [currentPeriod];
    for (
        let subtractMonthCount = 1;
        subtractMonthCount < 13;
        subtractMonthCount++
    ) {
        // JavaScript wraps around the year, so we don't need to handle that.
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - subtractMonthCount,
            1,
        );
        if (date > new Date('2024-03-31')) {
            selectablePeriods.push(toSelectablePeriod(date));
        }
    }
    return selectablePeriods;
};

const toPeriodsRecord = (
    periods: SelectablePeriod[],
): Record<string, SelectablePeriod> => {
    return periods.reduce(
        (acc, period) => {
            acc[period.key] = period;
            return acc;
        },
        {} as Record<string, SelectablePeriod>,
    );
};

export const newToChartData = (
    traffic?: SegmentedSchema,
): { datasets: ChartDatasetType[]; labels: (string | number)[] } => {
    if (!traffic) {
        return { labels: [], datasets: [] };
    }

    if (traffic.format === 'monthly') {
        return toMonthlyChartData(traffic);
    } else {
        return toDailyChartData(traffic, endpointsInfo);
    }
};

const prepareApiData = (apiData: SegmentedSchema['apiData']) =>
    apiData
        .filter((item) => item.apiPath in endpointsInfo)
        .sort(
            (item1: SegmentedSchemaApiData, item2: SegmentedSchemaApiData) =>
                endpointsInfo[item1.apiPath].order -
                endpointsInfo[item2.apiPath].order,
        );

const toMonthlyChartData = (
    traffic: SegmentedSchema,
): { datasets: ChartDatasetType[]; labels: string[] } => {
    const from = new Date(traffic.period.from);
    const to = new Date(traffic.period.to);
    const numMonths = Math.abs(differenceInCalendarMonths(to, from)) + 1;
    const formatMonth = (date: Date) => format(date, 'yyyy-MM');

    const datasets = prepareApiData(traffic.apiData).map(
        (item: SegmentedSchemaApiData) => {
            const monthsRec: { [month: string]: number } = {};
            for (let i = 0; i < numMonths; i++) {
                monthsRec[formatMonth(addMonths(from, i))] = 0;
            }

            for (const month of Object.values(item.dataPoints)) {
                monthsRec[month.when] = month.trafficTypes[0].count;
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

    const labels = Array.from({ length: numMonths + 1 }).map((_, index) =>
        formatMonth(addMonths(from, index)),
    );

    return { datasets, labels };
};

// const getDailyChartDataRec = (period: { from: string; to: string }) => {
//     const from = new Date(period.from);
//     const to = new Date(period.to);
//     const numDays = Math.abs(differenceInCalendarDays(to, from));
//     const formatDay = (date: Date) => format(date, 'yyyy-MM-dd');

//     const daysRec: { [day: string]: number } = {};
//     for (let i = 0; i <= numDays; i++) {
//         daysRec[formatDay(addDays(from, i))] = 0;
//     }

//     return () => ({
//         ...daysRec,
//     });
// };

// const toAnyChartData =
//     (getDataRec: () => { [key: string]: number }) =>
//     (
//         traffic: InstanceTrafficMetricsResponse2,
//         endpointsInfo: Record<string, EndpointInfo>,
//     ): ChartDatasetType[] => {
//         if (!traffic || !traffic.usage || !traffic.usage.apiData) {
//             return [];
//         }

//         const data = traffic.usage.apiData
//             .filter((item) => !!endpointsInfo[item.apiPath])
//             .sort(
//                 (
//                     item1: SegmentedSchemaApiData,
//                     item2: SegmentedSchemaApiData,
//                 ) =>
//                     endpointsInfo[item1.apiPath].order -
//                     endpointsInfo[item2.apiPath].order,
//             )
//             .map((item: SegmentedSchemaApiData) => {
//                 const entries = getDataRec();

//                 for (const day of Object.values(item.dataPoints)) {
//                     entries[day.when] = day.trafficTypes[0].count;
//                 }

//                 const epInfo = endpointsInfo[item.apiPath];

//                 return {
//                     label: epInfo.label,
//                     data: Object.values(entries),
//                     backgroundColor: epInfo.color,
//                     hoverBackgroundColor: epInfo.color,
//                 };
//             });

//         return data;
//     };

const toDailyChartData = (
    traffic: SegmentedSchema,
    endpointsInfo: Record<string, EndpointInfo>,
): { datasets: ChartDatasetType[]; labels: number[] } => {
    const from = new Date(traffic.period.from);
    const to = new Date(traffic.period.to);
    const numDays = Math.abs(differenceInCalendarDays(to, from)) + 1;
    const formatDay = (date: Date) => format(date, 'yyyy-MM-dd');

    const daysRec: { [day: string]: number } = {};
    for (let i = 0; i < numDays; i++) {
        daysRec[formatDay(addDays(from, i))] = 0;
    }

    const getDaysRec = () => ({
        ...daysRec,
    });

    const datasets = traffic.apiData
        .filter((item) => !!endpointsInfo[item.apiPath])
        .sort(
            (item1: SegmentedSchemaApiData, item2: SegmentedSchemaApiData) =>
                endpointsInfo[item1.apiPath].order -
                endpointsInfo[item2.apiPath].order,
        )
        .map((item: SegmentedSchemaApiData) => {
            const daysRec = getDaysRec();

            for (const day of Object.values(item.dataPoints)) {
                daysRec[day.when] = day.trafficTypes[0].count;
            }

            const epInfo = endpointsInfo[item.apiPath];

            return {
                label: epInfo.label,
                data: Object.values(daysRec),
                backgroundColor: epInfo.color,
                hoverBackgroundColor: epInfo.color,
            };
        });

    // simplification: assuming days run in a single month from the 1st onwards
    const labels = Array.from({ length: numDays }).map((_, index) => index + 1);

    console.log(labels, datasets);
    return { datasets, labels };
};

const toChartData = (
    days: number[],
    traffic: IInstanceTrafficMetricsResponse,
    endpointsInfo: Record<string, EndpointInfo>,
): ChartDatasetType[] => {
    if (!traffic || !traffic.usage || !traffic.usage.apiData) {
        return [];
    }

    // days contains all the days of the month because the usage data may not have entries for all days. so it

    const data = traffic.usage.apiData
        .filter((item) => !!endpointsInfo[item.apiPath]) // ignore /edge and unknown endpoints
        .sort(
            // sort the data such that admin goes before frontend goes before client
            (item1: any, item2: any) =>
                endpointsInfo[item1.apiPath].order -
                endpointsInfo[item2.apiPath].order,
        )
        .map((item: any) => {
            // generate a list of 0s for each day of the month
            const daysRec = days.reduce(
                (acc, day: number) => {
                    acc[`d${day}`] = 0;
                    return acc;
                },
                {} as Record<string, number>,
            );

            console.log(item, daysRec);

            // for each day in the usage data
            for (const dayKey in item.days) {
                const day = item.days[dayKey];
                // get the day of the month (probably don't need the Date parse)
                const dayNum = new Date(Date.parse(day.day)).getUTCDate();
                // add the count to the record for that day
                daysRec[`d${dayNum}`] = day.trafficTypes[0].count;
            }
            const epInfo = endpointsInfo[item.apiPath];

            console.log(daysRec, Object.values(daysRec));
            return {
                label: epInfo.label,
                // traversal order is well-defined
                data: Object.values(daysRec),
                backgroundColor: epInfo.color,
                hoverBackgroundColor: epInfo.color,
            };
        });

    console.log(
        'traffic data to chart data',
        days,
        traffic.usage,
        endpointsInfo,
        'result:',
        data,
    );

    return data;
};

const toTrafficUsageSum = (trafficData: ChartDatasetType[]): number => {
    const data = trafficData.reduce(
        (acc: number, current: ChartDatasetType) => {
            return (
                acc +
                current.data.reduce(
                    (acc_inner, current_inner) => acc_inner + current_inner,
                    0,
                )
            );
        },
        0,
    );
    return data;
};

const getDayLabels = (dayCount: number): number[] => {
    return [...Array(dayCount).keys()].map((i) => i + 1);
};

export const calculateOverageCost = (
    dataUsage: number,
    includedTraffic: number,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
): number => {
    if (dataUsage === 0) {
        return 0;
    }

    const overage =
        Math.floor((dataUsage - includedTraffic) / 1_000_000) * 1_000_000;
    return overage > 0
        ? calculateTrafficDataCost(overage, trafficUnitCost, trafficUnitSize)
        : 0;
};

export const calculateProjectedUsage = (
    today: number,
    trafficData: ChartDatasetType[],
    daysInPeriod: number,
) => {
    if (today < 5) {
        return 0;
    }

    const spliceToYesterday = today - 1;
    const trafficDataUpToYesterday = trafficData.map((item) => {
        return {
            ...item,
            data: item.data.slice(0, spliceToYesterday),
        };
    });

    const dataUsage = toTrafficUsageSum(trafficDataUpToYesterday);
    return (dataUsage / spliceToYesterday) * daysInPeriod;
};

export const calculateEstimatedMonthlyCost = (
    period: string,
    trafficData: ChartDatasetType[],
    includedTraffic: number,
    currentDate: Date,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
) => {
    if (period !== currentPeriod.key) {
        return 0;
    }

    const today = currentDate.getDate();
    const projectedUsage = calculateProjectedUsage(
        today,
        trafficData,
        currentPeriod.dayCount,
    );
    return calculateOverageCost(
        projectedUsage,
        includedTraffic,
        trafficUnitCost,
        trafficUnitSize,
    );
};

export const useTrafficDataEstimation = () => {
    const selectablePeriods = getSelectablePeriods();
    const record = toPeriodsRecord(selectablePeriods);
    console.log('RECORD', record); // Contains each month of the past year:
    //  {
    //     // ... other props
    //     "2024-12": {
    //         "key": "2024-12",
    //         "year": 2024,
    //         "month": 11,
    //         "dayCount": 31,
    //         "label": "December 2024"
    //     }
    // }
    const [period, setPeriod] = useState<string>(selectablePeriods[0].key);

    return {
        calculateTrafficDataCost,
        record,
        period,
        setPeriod,
        selectablePeriods,
        getDayLabels,
        currentPeriod,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
        calculateOverageCost,
        calculateEstimatedMonthlyCost,
    };
};
