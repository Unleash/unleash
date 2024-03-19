import type {
    IClientSegment,
    IFeatureStrategySegment,
    ISegment,
} from '../../types';

export interface ISegmentReadModel {
    getAll(): Promise<ISegment[]>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    getActive(): Promise<ISegment[]>;
    getActiveForClient(): Promise<IClientSegment[]>;
}
