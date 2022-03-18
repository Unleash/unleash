import { IFeatureStrategySegment, ISegment } from '../model';
import { Store } from './store';
import User from '../user';

export interface ISegmentStore extends Store<ISegment, number> {
    getAll(): Promise<ISegment[]>;

    getActive(): Promise<ISegment[]>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    create(
        segment: Omit<ISegment, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISegment>;

    update(segment: ISegment): Promise<ISegment>;

    delete(id: number): Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    removeFromStrategy(id: number, strategyId: string): Promise<void>;

    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
}
