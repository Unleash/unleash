import type { IPatStore } from '../../lib/types/stores/pat-store.js';
import type { CreatePatSchema, PatSchema } from '../../lib/openapi/index.js';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakePatStore implements IPatStore {
    create(
        _pat: CreatePatSchema,
        _secret: string,
        _userId: number,
    ): Promise<PatSchema> {
        throw new Error('Method not implemented.');
    }

    delete(_key: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    destroy(): void {}

    exists(_key: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    existsWithDescriptionByUser(
        _description: string,
        _userId: number,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    countByUser(_userId: number): Promise<number> {
        throw new Error('Method not implemented.');
    }

    get(_key: number): Promise<PatSchema> {
        throw new Error('Method not implemented.');
    }

    getAll(_query?: Object): Promise<PatSchema[]> {
        throw new Error('Method not implemented.');
    }

    getAllByUser(_userId: number): Promise<PatSchema[]> {
        throw new Error('Method not implemented.');
    }

    deleteForUser(_id: number, _userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
