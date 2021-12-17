import { IUnleashConfig } from 'lib/server-impl';
import { IUnleashStores } from 'lib/types';
import { ICustomRole, IPermission } from 'lib/types/model';
import {
    IAccessStore,
    IRoleWithPermissions,
} from 'lib/types/stores/access-store';
import { IRoleStore } from 'lib/types/stores/role-store';
import { Logger } from '../logger';

interface IRoleCreation {
    name: string;
    description: string;
    permissions?: IPermission[];
}

interface IRoleUpdate {
    id: number;
    name: string;
    description: string;
    permissions?: IPermission[];
}
export default class RoleService {
    private logger: Logger;

    private store: IRoleStore;

    private accessStore: IAccessStore;

    constructor(
        {
            roleStore,
            accessStore,
        }: Pick<IUnleashStores, 'roleStore' | 'accessStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('lib/services/session-service.ts');
        this.store = roleStore;
        this.accessStore = accessStore;
    }

    async getAll(): Promise<ICustomRole[]> {
        return this.store.getAll();
    }

    async get(id: number): Promise<IRoleWithPermissions> {
        const role = await this.store.get(id);
        const permissions = await this.accessStore.getPermissionsForRole(
            role.id,
        );
        return {
            ...role,
            permissions,
        };
    }

    async create(role: IRoleCreation): Promise<ICustomRole> {
        const baseRole = {
            name: role.name,
            description: role.description,
            roleType: 'custom',
        };
        const permissions = role.permissions;
        const newRole = await this.store.create(baseRole);
        if (permissions) {
            this.accessStore.addEnvironmentPermissionsToRole(
                newRole.id,
                permissions,
            );
        }
        return newRole;
    }

    async update(role: IRoleUpdate): Promise<ICustomRole> {
        const baseRole = {
            id: role.id,
            name: role.name,
            description: role.description,
            roleType: 'custom',
        };
        const permissions = role.permissions;
        const newRole = await this.store.update(baseRole);
        if (permissions) {
            this.accessStore.wipePermissionsFromRole(newRole.id);
            this.accessStore.addEnvironmentPermissionsToRole(
                newRole.id,
                permissions,
            );
        }
        return newRole;
    }

    async delete(id: number): Promise<void> {
        return this.store.delete(id);
    }
}
