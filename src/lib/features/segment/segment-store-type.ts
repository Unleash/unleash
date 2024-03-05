import { IFeatureStrategySegment, ISegment } from '../../types/model';
import { Store } from '../../types/stores/store';
import User from '../../types/user';

export interface ISegmentStore extends Store<ISegment, number> {
    getAll(includeChangeRequestUsageData?: boolean): Promise<ISegment[]>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    create(
        segment: Omit<ISegment, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISegment>;

    update(id: number, segment: Omit<ISegment, 'id'>): Promise<ISegment>;

    delete(id: number): Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    removeFromStrategy(id: number, strategyId: string): Promise<void>;

    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;

    existsByName(name: string): Promise<boolean>;

    count(): Promise<number>;
}
