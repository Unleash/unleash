import type {
    IStatTrafficUsageKey,
    IStatTrafficUsage,
} from './traffic-data-usage-store-type';
import type { ITrafficDataUsageStore } from '../../types';

export class FakeTrafficDataUsageStore implements ITrafficDataUsageStore {
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
    upsert(trafficDataUsage: IStatTrafficUsage): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getTrafficDataUsageForPeriod(period: string): Promise<IStatTrafficUsage[]> {
        throw new Error('Method not implemented.');
    }
}
