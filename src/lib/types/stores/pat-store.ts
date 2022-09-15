import { Store } from './store';
import { IPat } from '../models/pat';

export interface IPatStore extends Store<IPat, string> {
    create(group: IPat): Promise<IPat>;
    getAllByUser(userId: number): Promise<IPat[]>;
}
