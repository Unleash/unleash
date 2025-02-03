// todo: delete file when you remove flag dataUsageMultiMonthView
import type { ChartDatasetType } from 'component/admin/network/NetworkTrafficUsage/chart-functions';
import type { IInstanceTrafficMetricsResponse } from './api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useState } from 'react';

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
const toChartData = (
    days: number[],
    traffic: IInstanceTrafficMetricsResponse,
    endpointsInfo: Record<string, EndpointInfo>,
): ChartDatasetType[] => {
    if (!traffic || !traffic.usage || !traffic.usage.apiData) {
        return [];
    }

    const data = traffic.usage.apiData
        .filter((item) => !!endpointsInfo[item.apiPath])
        .sort(
            (item1: any, item2: any) =>
                endpointsInfo[item1.apiPath].order -
                endpointsInfo[item2.apiPath].order,
        )
        .map((item: any) => {
            const daysRec = days.reduce(
                (acc, day: number) => {
                    acc[`d${day}`] = 0;
                    return acc;
                },
                {} as Record<string, number>,
            );

            for (const dayKey in item.days) {
                const day = item.days[dayKey];
                const dayNum = new Date(Date.parse(day.day)).getUTCDate();
                daysRec[`d${dayNum}`] = day.trafficTypes[0].count;
            }
            const epInfo = endpointsInfo[item.apiPath];

            return {
                label: epInfo.label,
                data: Object.values(daysRec),
                backgroundColor: epInfo.color,
                hoverBackgroundColor: epInfo.color,
            };
        });

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

export const useTrafficDataEstimation = () => {
    const selectablePeriods = getSelectablePeriods();
    const record = toPeriodsRecord(selectablePeriods);
    const [period, setPeriod] = useState<string>(selectablePeriods[0].key);

    return {
        record,
        period,
        setPeriod,
        selectablePeriods,
        getDayLabels,
        currentPeriod,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
    };
};
