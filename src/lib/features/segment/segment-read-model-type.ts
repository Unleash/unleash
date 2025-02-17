import type {
    IClientSegment,
    IFeatureStrategySegment,
    ISegment,
} from '../../types';

export interface ISegmentReadModel {
    getAll(ids?: number[]): Promise<ISegment[]>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    getActive(): Promise<ISegment[]>;
    getActiveForClient(): Promise<IClientSegment[]>;
    getAllForClientIds(ids?: number[]): Promise<IClientSegment[]>;
}
