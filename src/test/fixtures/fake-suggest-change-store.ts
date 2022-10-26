import { ISuggestChangeStore } from '../../lib/types/stores/suggest-change-store';
import {
    ISuggestChange,
    ISuggestChangeset,
    SuggestChangesetState,
} from '../../lib/types/model';
import { PartialSome } from '../../lib/types/partial';

export default class FakeSuggestChangeStore implements ISuggestChangeStore {
    suggestChanges: ISuggestChangeset[] = [];

    async get(id: number): Promise<ISuggestChangeset> {
        const change = this.suggestChanges.find((c) => c.id === id);
        return Promise.resolve(change);
    }

    async count(): Promise<number> {
        return Promise.resolve(0);
    }

    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async delete(id: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    addChangeToSet(
        change: PartialSome<ISuggestChange, 'id' | 'createdBy' | 'createdAt'>,
        changeSetID: number,
        userId: number,
    ): Promise<void> {
        const changeSet = this.suggestChanges.find((s) => s.id === changeSetID);
        changeSet.changes.push({
            createdBy: { id: userId, username: '', imageUrl: '' },
            ...change,
        });
        return Promise.resolve();
    }

    getForEnvironment(environment: string): Promise<ISuggestChangeset[]> {
        return Promise.resolve(
            this.suggestChanges.filter(
                (changeSet) => changeSet.environment === environment,
            ),
        );
    }

    getDraftsForUser(
        userId: number,
        project: string,
    ): Promise<ISuggestChangeset[]> {
        return Promise.resolve(
            this.suggestChanges.filter(
                (changeSet) =>
                    changeSet.project === project &&
                    changeSet.createdBy.id === userId,
            ),
        );
    }

    getForProject(project: string): Promise<ISuggestChangeset[]> {
        return Promise.resolve(
            this.suggestChanges.filter(
                (changeSet) => changeSet.project === project,
            ),
        );
    }

    create(
        suggestChangeSet: PartialSome<ISuggestChangeset, 'id'>,
        userId: number,
    ): Promise<ISuggestChangeset> {
        this.suggestChanges.push({
            id: 1,
            ...suggestChangeSet,
            createdBy: { id: userId, username: '', imageUrl: '' },
        });
        return Promise.resolve(undefined);
    }

    getAll(): Promise<ISuggestChangeset[]> {
        return Promise.resolve([]);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    exists(key: number): Promise<boolean> {
        return Promise.resolve(Boolean(key));
    }

    updateState(
        id: number,
        state: SuggestChangesetState,
    ): Promise<ISuggestChangeset> {
        const changeSet = this.suggestChanges.find((s) => s.id === id);
        changeSet.state = state;
        return Promise.resolve(undefined);
    }
}
