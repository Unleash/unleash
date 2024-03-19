import type { Store } from './store';
import type { CreatePatSchema, PatSchema } from '../../openapi';

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
