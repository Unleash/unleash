/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RoleSchema } from '../../lib/openapi/index.js';
import type { ICustomRole } from '../../lib/types/model.js';
import type { IRole, IUserRole } from '../../lib/types/stores/access-store.js';
import type {
    ICustomRoleInsert,
    ICustomRoleUpdate,
    IRoleStore,
} from '../../lib/types/stores/role-store.js';

export default class FakeRoleStore implements IRoleStore {
    count(): Promise<number> {
        return Promise.resolve(0);
    }

    filteredCount(_search: Partial<RoleSchema>): Promise<number> {
        return Promise.resolve(0);
    }

    filteredCountInUse(_search: Partial<RoleSchema>): Promise<number> {
        return Promise.resolve(0);
    }

    roles: ICustomRole[] = [];

    getGroupRolesForProject(_projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    nameInUse(name: string, _existingId?: number): Promise<boolean> {
        return Promise.resolve(
            this.roles.find((r) => r.name === name) !== undefined,
        );
    }

    async getAll(): Promise<ICustomRole[]> {
        return this.roles;
    }

    async create(role: ICustomRoleInsert): Promise<ICustomRole> {
        const roleCreated = {
            ...role,
            type: role.roleType,
            id: this.roles.length,
            roleType: undefined, // roleType is not part of ICustomRole and simulates what the DB responds
        };
        this.roles.push(roleCreated);
        return Promise.resolve(roleCreated);
    }

    update(_role: ICustomRoleUpdate): Promise<ICustomRole> {
        throw new Error('Method not implemented.');
    }

    delete(_id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    async getRoleByName(name: string): Promise<IRole> {
        return this.roles.find((r) => r.name === name) as IRole;
    }

    getRolesForProject(_projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    removeRolesForProject(_projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getProjectRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    async getRootRoles(): Promise<IRole[]> {
        return this.roles;
    }

    getRootRoleForAllUsers(): Promise<IUserRole[]> {
        throw new Error('Method not implemented.');
    }

    get(id: number): Promise<ICustomRole> {
        const found = this.roles.find((r) => r.id === id);
        if (!found) {
            // this edge case is not properly contemplated in the type definition
            throw new Error('Not found');
        }
        return Promise.resolve(found);
    }

    exists(_key: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    destroy(): void {
        throw new Error('Method not implemented.');
    }
}
