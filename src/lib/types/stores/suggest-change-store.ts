import { Store } from './store';
import { ISuggestChange, ISuggestChangeSet } from '../model';
import { PartialSome } from '../partial';
import User from '../user';

export interface ISuggestChangeStore extends Store<ISuggestChangeSet, number> {
    create(
        suggestChangeSet: PartialSome<ISuggestChangeSet, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeSet>;

    addChangeToSet(
        change: ISuggestChange,
        changeSetID: number,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<void>;

    get(id: number): Promise<ISuggestChangeSet>;

    getAll(): Promise<ISuggestChangeSet[]>;

    getForProject(project: string): Promise<ISuggestChangeSet[]>;

    getForEnvironment(environment: string): Promise<ISuggestChangeSet[]>;
}
