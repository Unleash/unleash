import { ICustomRole } from 'lib/types/model';
import {
    ICustomRoleInsert,
    ICustomRoleUpdate,
    IRoleStore,
} from 'lib/types/stores/role-store';
import {
    IUserFeedback,
    IUserFeedbackKey,
    IUserFeedbackStore,
} from '../../lib/types/stores/user-feedback-store';

export default class FakeRoleStore implements IRoleStore {
    async update(role: ICustomRoleUpdate): Promise<ICustomRole> {
        throw new Error('Method not implemented.');
    }

    async get(key: number): Promise<ICustomRole> {
        return Promise.resolve({
            id: 1,
            name: 'Role',
            description: 'Hello',
            type: 'custom',
        });
    }

    async getAll(): Promise<ICustomRole[]> {
        return Promise.resolve([
            {
                id: 1,
                name: 'Role',
                description: 'Hello',
                type: 'custom',
            },
        ]);
    }

    async exists(): Promise<boolean> {
        return Promise.resolve(true);
    }

    create(role: ICustomRoleInsert): Promise<ICustomRole> {
        return Promise.resolve({
            id: 1,
            name: 'Role',
            description: 'Hello',
            type: 'custom',
        });
    }

    delete(id: number): Promise<void> {
        return Promise.resolve();
    }

    destroy(): Promise<void> {
        return Promise.resolve();
    }

    deleteAll(): Promise<void> {
        return Promise.resolve();
    }
}
