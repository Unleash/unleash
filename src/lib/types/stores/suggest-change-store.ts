import { Store } from './store';
import { ISuggestChangeSet } from '../model';
import { PartialSome } from '../partial';
import User from '../user';

export interface ISuggestChangeStore extends Store<ISuggestChangeSet, number> {
    create(
        suggestChangeSet: PartialSome<ISuggestChangeSet, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeSet>;
    getAll(): Promise<ISuggestChangeSet[]>;
    get(id: number): Promise<ISuggestChangeSet>;
}
