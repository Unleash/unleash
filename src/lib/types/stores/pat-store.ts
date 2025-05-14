import type { Store } from './store.js';
import type { CreatePatSchema, PatSchema } from '../../openapi/index.js';

export interface IPatStore extends Store<PatSchema, number> {
    create(
        pat: CreatePatSchema,
        secret: string,
        userId: number,
    ): Promise<PatSchema>;
    getAllByUser(userId: number): Promise<PatSchema[]>;
    deleteForUser(id: number, userId: number): Promise<void>;
    existsWithDescriptionByUser(
        description: string,
        userId: number,
    ): Promise<boolean>;
    countByUser(userId: number): Promise<number>;
}
