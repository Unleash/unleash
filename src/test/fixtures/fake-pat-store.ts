import type { IPatStore } from '../../lib/types/stores/pat-store';
import type { CreatePatSchema, PatSchema } from '../../lib/openapi';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakePatStore implements IPatStore {
    create(
        pat: CreatePatSchema,
        secret: string,
        userId: number,
    ): Promise<PatSchema> {
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

    countByUser(userId: number): Promise<number> {
        throw new Error('Method not implemented.');
    }

    get(key: number): Promise<PatSchema> {
        throw new Error('Method not implemented.');
    }

    getAll(query?: Object): Promise<PatSchema[]> {
        throw new Error('Method not implemented.');
    }

    getAllByUser(userId: number): Promise<PatSchema[]> {
        throw new Error('Method not implemented.');
    }

    deleteForUser(id: number, userId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
