import { Store } from './store';
import { IPat } from '../models/pat';

export interface IPatStore extends Store<IPat, number> {
    create(group: IPat): Promise<IPat>;
    getAllByUser(userId: number): Promise<IPat[]>;
    deleteForUser(id: number, userId: number): Promise<void>;
    existsWithDescriptionByUser(
        description: string,
        userId: number,
    ): Promise<boolean>;
}
