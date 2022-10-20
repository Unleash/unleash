import { Store } from './store';
import { ISuggestChange, ISuggestChangeset } from '../model';
import { PartialSome } from '../partial';
import User from '../user';

export interface ISuggestChangeStore extends Store<ISuggestChangeset, number> {
    create(
        suggestChangeSet: PartialSome<ISuggestChangeset, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeset>;

    addChangeToSet(
        change: ISuggestChange,
        changeSetID: number,
        user: Partial<Pick<User, 'username' | 'email'>>,
        shouldReturn?: boolean,
    ): Promise<void | ISuggestChangeset>;

    get(id: number): Promise<ISuggestChangeset>;

    getAll(): Promise<ISuggestChangeset[]>;

    getForProject(project: string): Promise<ISuggestChangeset[]>;

    getForEnvironment(environment: string): Promise<ISuggestChangeset[]>;
}
