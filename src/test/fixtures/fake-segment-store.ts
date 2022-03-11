import { ISegmentStore } from '../../lib/types/stores/segment-store';
import { ISegment } from '../../lib/types/model';

export default class FakeSegmentStore implements ISegmentStore {
    create(): Promise<ISegment> {
        throw new Error('Method not implemented.');
    }

    delete(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    exists(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    get(): Promise<ISegment> {
        throw new Error('Method not implemented.');
    }

    getAll(): Promise<ISegment[]> {
        throw new Error('Method not implemented.');
    }

    getActive(): Promise<ISegment[]> {
        throw new Error('Method not implemented.');
    }

    getByStrategy(): Promise<ISegment[]> {
        throw new Error('Method not implemented.');
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

    destroy(): void {}
}
