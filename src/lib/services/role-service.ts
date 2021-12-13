import { IUnleashConfig } from 'lib/server-impl';
import { IUnleashStores } from 'lib/types';
import { ICustomRole, IPermission } from 'lib/types/model';
import { IAccessStore } from 'lib/types/stores/access-store';
import { IRoleStore } from 'lib/types/stores/role-store';
import { Logger } from '../logger';

interface IRoleCreation {
    name: string;
    description: string;
    roleType: string;
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

    async get(id: number): Promise<ICustomRole> {
        return this.store.get(id);
    }

    async create(role: IRoleCreation): Promise<ICustomRole> {
        const baseRole = {
            name: role.name,
            description: role.description,
            roleType: role.roleType,
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

    async delete(id: number): Promise<void> {
        return this.store.delete(id);
    }
}
