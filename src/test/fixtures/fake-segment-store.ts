import type { ISegmentStore } from '../../lib/features/segment/segment-store-type.js';
import type {
    IFeatureStrategySegment,
    ISegment,
} from '../../lib/types/model.js';

export default class FakeSegmentStore implements ISegmentStore {
    segments: ISegment[] = [];
    currentId: number = 0;

    async count(): Promise<number> {
        return this.segments.length;
    }

    async create(segment: Omit<ISegment, 'id'>): Promise<ISegment> {
        const newSegment = { ...segment, id: this.currentId };
        this.currentId = this.currentId + 1;
        this.segments.push(newSegment);

        return newSegment;
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

    async existsByName(name: string): Promise<boolean> {
        return this.segments.some((segment) => segment.name === name);
    }

    destroy(): void {}

    async getProjectSegmentCount(): Promise<number> {
        return 0;
    }
}
