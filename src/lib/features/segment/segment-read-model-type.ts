import { IFeatureStrategySegment, ISegment } from '../../types';

export interface ISegmentReadModel {
    getAll(): Promise<ISegment[]>;
    getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]>;
}
