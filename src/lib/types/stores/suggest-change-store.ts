import { Store } from './store';
import {
    ISuggestChange,
    ISuggestChangeset,
    SuggestChangesetState,
} from '../model';
import { PartialSome } from '../partial';

export interface ISuggestChangeStore extends Store<ISuggestChangeset, number> {
    create(
        suggestChangeSet: PartialSome<
            ISuggestChangeset,
            'id' | 'createdBy' | 'createdAt'
        >,
        userId: number,
    ): Promise<ISuggestChangeset>;

    addChangeToSet(
        change: PartialSome<ISuggestChange, 'id' | 'createdBy' | 'createdAt'>,
        changeSetID: number,
        userId: number,
    ): Promise<void>;

    get(id: number): Promise<ISuggestChangeset>;

    updateState(
        id: number,
        state: SuggestChangesetState,
    ): Promise<ISuggestChangeset>;

    getAll(): Promise<ISuggestChangeset[]>;

    getForProject(project: string): Promise<ISuggestChangeset[]>;

    getDraftsForUser(
        userId: number,
        project: string,
    ): Promise<ISuggestChangeset[]>;

    getForEnvironment(environment: string): Promise<ISuggestChangeset[]>;
}
