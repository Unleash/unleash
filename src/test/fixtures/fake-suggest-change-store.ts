import { ISuggestChangeStore } from '../../lib/types/stores/suggest-change-store';
import { ISuggestChange, ISuggestChangeSet } from '../../lib/types/model';
import { PartialSome } from '../../lib/types/partial';
import User from '../../lib/types/user';

export default class FakeSuggestChangeStore implements ISuggestChangeStore {
    suggestChanges: ISuggestChangeSet[] = [];

    async get(id: number): Promise<ISuggestChangeSet> {
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
        const changeSet = this.suggestChanges.find((s) => (s.id = changeSetID));
        changeSet.changes.push(change);
        return Promise.resolve();
    }

    getForEnvironment(environment: string): Promise<ISuggestChangeSet[]> {
        return Promise.resolve(
            this.suggestChanges.filter(
                (changeSet) => (changeSet.environment = environment),
            ),
        );
    }

    getForProject(project: string): Promise<ISuggestChangeSet[]> {
        return Promise.resolve(
            this.suggestChanges.filter(
                (changeSet) => (changeSet.project = project),
            ),
        );
    }

    create(
        suggestChangeSet: PartialSome<ISuggestChangeSet, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeSet> {
        this.suggestChanges.push({
            id: 1,
            ...suggestChangeSet,
            createdBy: user.email,
        });
        return Promise.resolve(undefined);
    }

    getAll(): Promise<ISuggestChangeSet[]> {
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
