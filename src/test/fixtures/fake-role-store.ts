/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICustomRole } from 'lib/types/model';
import { IRole, IUserRole } from 'lib/types/stores/access-store';
import {
    ICustomRoleInsert,
    ICustomRoleUpdate,
    IRoleStore,
} from 'lib/types/stores/role-store';

export default class FakeRoleStore implements IRoleStore {
    roles: ICustomRole[] = [];

    getGroupRolesForProject(projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    nameInUse(name: string, existingId: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async getAll(): Promise<ICustomRole[]> {
        return this.roles;
    }

    async create(role: ICustomRoleInsert): Promise<ICustomRole> {
        const roleCreated = {
            ...role,
            type: 'some-type',
            id: this.roles.length,
        };
        this.roles.push(roleCreated);
        return Promise.resolve(roleCreated);
    }

    update(role: ICustomRoleUpdate): Promise<ICustomRole> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    async getRoleByName(name: string): Promise<IRole> {
        return this.roles.find((r) => (r.name = name));
    }

    getRolesForProject(projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    removeRolesForProject(projectId: string): Promise<void> {
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

    get(key: number): Promise<ICustomRole> {
        throw new Error('Method not implemented.');
    }

    exists(key: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    destroy(): void {
        throw new Error('Method not implemented.');
    }
}
