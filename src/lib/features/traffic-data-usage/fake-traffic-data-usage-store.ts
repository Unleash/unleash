import type {
    IStatTrafficUsageKey,
    IStatTrafficUsage,
    IStatMonthlyTrafficUsage,
} from './traffic-data-usage-store-type.js';
import type { ITrafficDataUsageStore } from '../../types/index.js';
import {
    differenceInCalendarMonths,
    endOfDay,
    format,
    isSameMonth,
    parse,
    startOfDay,
} from 'date-fns';

export class FakeTrafficDataUsageStore implements ITrafficDataUsageStore {
    private trafficData: IStatTrafficUsage[] = [];

    get(_key: IStatTrafficUsageKey): Promise<IStatTrafficUsage> {
        throw new Error('Method not implemented.');
    }
    getAll(_query?: Object | undefined): Promise<IStatTrafficUsage[]> {
        throw new Error('Method not implemented.');
    }
    exists(_key: IStatTrafficUsageKey): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    delete(_key: IStatTrafficUsageKey): Promise<void> {
        throw new Error('Method not implemented.');
    }
    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    destroy(): void {
        throw new Error('Method not implemented.');
    }
    async upsert(trafficDataUsage: IStatTrafficUsage): Promise<void> {
        const index = this.trafficData.findIndex(
            (data) =>
                data.day.getTime() === trafficDataUsage.day.getTime() &&
                data.trafficGroup === trafficDataUsage.trafficGroup &&
                data.statusCodeSeries === trafficDataUsage.statusCodeSeries,
        );

        if (index >= 0) {
            this.trafficData[index].count += trafficDataUsage.count;
        } else {
            this.trafficData.push(trafficDataUsage);
        }
    }

    async getTrafficDataUsageForPeriod(
        period: string,
    ): Promise<IStatTrafficUsage[]> {
        const periodDate = parse(period, 'yyyy-MM', new Date());

        return this.trafficData.filter((data) =>
            isSameMonth(data.day, periodDate),
        );
    }

    async getTrafficDataForMonthRange(
        monthsBack: number,
    ): Promise<IStatMonthlyTrafficUsage[]> {
        const now = new Date();

        const data: { [key: string]: IStatMonthlyTrafficUsage } =
            this.trafficData
                .filter(
                    (entry) =>
                        differenceInCalendarMonths(now, entry.day) <=
                        monthsBack,
                )
                .reduce((acc, entry) => {
                    const month = format(entry.day, 'yyyy-MM');
                    const key = `${month}-${entry.trafficGroup}-${entry.statusCodeSeries}`;

                    if (acc[key]) {
                        acc[key].count += entry.count;
                    } else {
                        acc[key] = {
                            month,
                            trafficGroup: entry.trafficGroup,
                            statusCodeSeries: entry.statusCodeSeries,
                            count: entry.count,
                        };
                    }

                    return acc;
                }, {});

        return Object.values(data);
    }

    async getDailyTrafficDataUsageForPeriod(
        from: Date,
        to: Date,
    ): Promise<IStatTrafficUsage[]> {
        return this.trafficData.filter(
            (data) => data.day >= startOfDay(from) && data.day <= endOfDay(to),
        );
    }

    async getMonthlyTrafficDataUsageForPeriod(
        from: Date,
        to: Date,
    ): Promise<IStatMonthlyTrafficUsage[]> {
        const data: { [key: string]: IStatMonthlyTrafficUsage } =
            this.trafficData
                .filter(
                    (data) =>
                        data.day >= startOfDay(from) &&
                        data.day <= endOfDay(to),
                )
                .reduce((acc, entry) => {
                    const month = format(entry.day, 'yyyy-MM');
                    const key = `${month}-${entry.trafficGroup}-${entry.statusCodeSeries}`;

                    if (acc[key]) {
                        acc[key].count += entry.count;
                    } else {
                        acc[key] = {
                            month,
                            trafficGroup: entry.trafficGroup,
                            statusCodeSeries: entry.statusCodeSeries,
                            count: entry.count,
                        };
                    }

                    return acc;
                }, {});

        return Object.values(data);
    }
}
