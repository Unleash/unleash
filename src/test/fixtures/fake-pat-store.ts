import { IPatStore } from '../../lib/types/stores/pat-store';
import { IPat } from '../../lib/types/models/pat';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakePatStore implements IPatStore {
    create(group: IPat): Promise<IPat> {
        throw new Error('Method not implemented.');
    }

    delete(key: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    destroy(): void {}

    exists(key: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    existsWithDescriptionByUser(
        description: string,
        userId: number,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    get(key: number): Promise<IPat> {
        throw new Error('Method not implemented.');
    }

    getAll(query?: Object): Promise<IPat[]> {
        throw new Error('Method not implemented.');
    }

    getAllByUser(userId: number): Promise<IPat[]> {
        throw new Error('Method not implemented.');
    }

    deleteForUser(id: number, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
