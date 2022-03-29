import { ISegmentStore } from '../../lib/types/stores/segment-store';
import { IFeatureStrategySegment, ISegment } from '../../lib/types/model';

export default class FakeSegmentStore implements ISegmentStore {
    create(): Promise<ISegment> {
        throw new Error('Method not implemented.');
    }

    async delete(): Promise<void> {
        return;
    }

    async deleteAll(): Promise<void> {
        return;
    }

    async exists(): Promise<boolean> {
        return false;
    }

    get(): Promise<ISegment> {
        throw new Error('Method not implemented.');
    }

    async getAll(): Promise<ISegment[]> {
        return [];
    }

    async getActive(): Promise<ISegment[]> {
        return [];
    }

    async getByStrategy(): Promise<ISegment[]> {
        return [];
    }

    update(): Promise<ISegment> {
        throw new Error('Method not implemented.');
    }

    addToStrategy(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeFromStrategy(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]> {
        return [];
    }

    destroy(): void {}
}
