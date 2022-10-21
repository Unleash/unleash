import { ISuggestChangeStore } from '../../lib/types/stores/suggest-change-store';
import { ISuggestChange, ISuggestChangeset } from '../../lib/types/model';
import { PartialSome } from '../../lib/types/partial';
import User from '../../lib/types/user';

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
        change: ISuggestChange,
        changeSetID: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<void> {
        const changeSet = this.suggestChanges.find((s) => s.id === changeSetID);
        changeSet.changes.push(change);
        return Promise.resolve();
    }

    getForEnvironment(environment: string): Promise<ISuggestChangeset[]> {
        return Promise.resolve(
            this.suggestChanges.filter(
                (changeSet) => changeSet.environment === environment,
            ),
        );
    }

    getForUser(user: User): Promise<ISuggestChangeset> {
        return Promise.resolve(
            this.suggestChanges.find(
                (changeSet) => changeSet.createdBy.id === user.id,
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
        user: Partial<Pick<User, 'id' | 'username' | 'email'>>,
    ): Promise<ISuggestChangeset> {
        this.suggestChanges.push({
            id: 1,
            ...suggestChangeSet,
            createdBy: { id: user.id, username: user.email, imageUrl: '' },
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
}
