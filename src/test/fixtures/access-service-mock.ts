/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    AccessService,
    type AccessWithRoles,
} from '../../lib/services/access-service.js';
import type User from '../../lib/types/user.js';
import noLoggerProvider from './no-logger.js';
import type { IRole } from '../../lib/types/stores/access-store.js';
import { type IAvailablePermissions, RoleName } from '../../lib/types/model.js';

class AccessServiceMock extends AccessService {
    constructor() {
        super(
            {
                // @ts-expect-error - We're mocking the service so we don't need the store
                accessStore: undefined,
                // @ts-expect-error - We're mocking the service so we don't need the store
                accountStore: undefined,
                // @ts-expect-error - We're mocking the service so we don't need the store
                roleStore: undefined,
                // @ts-expect-error - We're mocking the service so we don't need the store
                environmentStore: undefined,
            },
            { getLogger: noLoggerProvider },
            undefined,
            undefined,
        );
    }

    hasPermission(
        user: User,
        permission: string,
        projectId?: string,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getPermissions(): Promise<IAvailablePermissions> {
        throw new Error('Method not implemented.');
    }

    addUserToRole(userId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setUserRootRole(userId: number, roleId: number): Promise<void> {
        return Promise.resolve();
    }

    addPermissionToRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removePermissionFromRole(
        roleId: number,
        permission: string,
        projectId?: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRoles(): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getRolesForProject(projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getRolesForUser(userId: number): Promise<IRole[]> {
        return Promise.resolve([{ id: 1, name: 'Admin', type: 'root' }]);
    }

    getUserRootRoles(userId: number): Promise<IRole[]> {
        return Promise.resolve([{ id: 1, name: 'Admin', type: 'root' }]);
    }

    getUsersForRole(roleId: any): Promise<User[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoleAccess(projectId: string): Promise<AccessWithRoles> {
        throw new Error('Method not implemented.');
    }

    createDefaultProjectRoles(owner: User, projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeDefaultProjectRoles(owner: User, projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getRootRole(roleName: RoleName): Promise<IRole> {
        return Promise.resolve({ id: 1, name: roleName, type: 'root' });
    }

    getRootRoleForUser(userId: number): Promise<IRole> {
        return Promise.resolve({ id: 1, name: RoleName.VIEWER, type: 'root' });
    }
}

export default AccessServiceMock;
