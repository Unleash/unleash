import type {
    IStatTrafficUsageKey,
    IStatTrafficUsage,
} from './traffic-data-usage-store-type';
import type { ITrafficDataUsageStore } from '../../types';
import { isSameMonth, parse } from 'date-fns';

export class FakeTrafficDataUsageStore implements ITrafficDataUsageStore {
    private trafficData: IStatTrafficUsage[] = [];

    get(key: IStatTrafficUsageKey): Promise<IStatTrafficUsage> {
        throw new Error('Method not implemented.');
    }
    getAll(query?: Object | undefined): Promise<IStatTrafficUsage[]> {
        throw new Error('Method not implemented.');
    }
    exists(key: IStatTrafficUsageKey): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    delete(key: IStatTrafficUsageKey): Promise<void> {
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
}
