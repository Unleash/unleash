import type {
    IClientSegment,
    IFeatureStrategySegment,
    ISegment,
} from '../../types/index.js';

export interface ISegmentReadModel {
    getAll(ids?: number[]): Promise<ISegment[]>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
    getActive(): Promise<ISegment[]>;
    getActiveForClient(): Promise<IClientSegment[]>;
    getAllForClientIds(ids?: number[]): Promise<IClientSegment[]>;
}
