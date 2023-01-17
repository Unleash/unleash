/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AccessService } from '../../lib/services/access-service';
import noLoggerProvider from './no-logger';
import { IRole } from '../../lib/types/stores/access-store';
import { IAvailablePermissions } from '../../lib/types/model';
import { IGroupModelWithProjectRole } from '../../lib/types/group';
import { IAccount, IAccountWithRole } from '../../lib/types';

class AccessServiceMock extends AccessService {
    constructor() {
        super(
            {
                accessStore: undefined,
                accountStore: undefined,
                roleStore: undefined,
                environmentStore: undefined,
            },
            { getLogger: noLoggerProvider },
            undefined,
        );
    }

    hasPermission(
        account: IAccount,
        permission: string,
        projectId?: string,
    ): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getPermissions(): Promise<IAvailablePermissions> {
        throw new Error('Method not implemented.');
    }

    addAccountToRole(accountId: number, roleId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    setAccountRootRole(accountId: number, roleId: number): Promise<void> {
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

    getRolesForAccount(accountId: number): Promise<IRole[]> {
        throw new Error('Method not implemented.');
    }

    getAccountsForRole(roleId: any): Promise<IAccount[]> {
        throw new Error('Method not implemented.');
    }

    getProjectRoleAccess(
        projectId: string,
    ): Promise<[IRole[], IAccountWithRole[], IGroupModelWithProjectRole[]]> {
        throw new Error('Method not implemented.');
    }

    createDefaultProjectRoles(
        owner: IAccount,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeDefaultProjectRoles(
        owner: IAccount,
        projectId: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

export default AccessServiceMock;
