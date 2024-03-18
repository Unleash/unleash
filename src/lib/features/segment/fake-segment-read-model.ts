import type {
    IClientSegment,
    IFeatureStrategySegment,
    ISegment,
} from '../../types';
import type { ISegmentReadModel } from './segment-read-model-type';

export class FakeSegmentReadModel implements ISegmentReadModel {
    constructor(private segments: ISegment[] = []) {}

    async getAll(): Promise<ISegment[]> {
        return this.segments;
    }

    async getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]> {
        return [];
    }

    async getActive(): Promise<ISegment[]> {
        return this.segments;
    }

    async getActiveForClient(): Promise<IClientSegment[]> {
        return [];
    }
}
