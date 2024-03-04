import { IFeatureStrategySegment, ISegment } from '../../types';
import { ISegmentReadModel } from './segment-read-model-type';

export class FakeSegmentReadModel implements ISegmentReadModel {
    async getAll(): Promise<ISegment[]> {
        return [];
    }

    async getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]> {
        return [];
    }
}
