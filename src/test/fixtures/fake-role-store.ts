/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICustomRole } from 'lib/types/model';
import { IRole, IUserRole } from 'lib/types/stores/access-store';
import {
    ICustomRoleInsert,
    ICustomRoleUpdate,
    IRoleStore,
} from 'lib/types/stores/role-store';

export default class FakeRoleStore implements IRoleStore {
    nameInUse(name: string, existingId: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getAll(): Promise<ICustomRole[]> {
        throw new Error('Method not implemented.');
    }

    create(role: ICustomRoleInsert): Promise<ICustomRole> {
        throw new Error('Method not implemented.');
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

    getRoleByName(name: string): Promise<IRole> {
        throw new Error('Method not implemented.');
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

    getRootRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
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
