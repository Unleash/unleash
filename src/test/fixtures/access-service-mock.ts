/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IRole } from '../../lib/db/access-store';
import {
    AccessService,
    IUserWithRole,
    RoleName,
    IPermission,
    IRoleData,
} from '../../lib/services/access-service';
import User from '../../lib/types/user';
import noLoggerProvider from './no-logger';

class AccessServiceMock extends AccessService {
    public roleName: RoleName;

    constructor() {
        super(
            { accessStore: undefined, userStore: undefined },
            { getLogger: noLoggerProvider },
        );
    }

    hasPermission(
        user: User,
        permission: string,
        projectId?: string,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getPermissions(): IPermission[] {
        throw new Error('Method not implemented.');
    }

    addUserToRole(userId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setUserRootRole(userId: number, roleId: number): Promise<void> {
        return Promise.resolve();
    }

    removeUserFromRole(userId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
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

    getRole(roleId: number): Promise<IRoleData> {
        throw new Error('Method not implemented.');
    }

    getRolesForProject(projectId: string): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getRolesForUser(userId: number): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getUsersForRole(roleId: any): Promise<User[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoleUsers(
        projectId: string,
    ): Promise<[IRole[], IUserWithRole[]]> {
        throw new Error('Method not implemented.');
    }

    createDefaultProjectRoles(owner: User, projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeDefaultProjectRoles(owner: User, projectId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

export default AccessServiceMock;
