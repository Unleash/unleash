import type { IFeatureStrategySegment, ISegment } from '../../types/model.js';
import type { Store } from '../../types/stores/store.js';
import type { IAuditUser } from '../../types/user.js';

export interface ISegmentStore extends Store<ISegment, number> {
    getAll(includeChangeRequestUsageData?: boolean): Promise<ISegment[]>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    create(
        segment: Omit<ISegment, 'id'>,
        createdBy: Pick<IAuditUser, 'username'>,
    ): Promise<ISegment>;

    update(id: number, segment: Omit<ISegment, 'id'>): Promise<ISegment>;

    delete(id: number): Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    removeFromStrategy(id: number, strategyId: string): Promise<void>;

    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;

    existsByName(name: string): Promise<boolean>;

    count(): Promise<number>;

    getProjectSegmentCount(projectId: string): Promise<number>;
}
