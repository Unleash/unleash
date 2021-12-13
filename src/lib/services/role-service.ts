import { IUnleashConfig } from 'lib/server-impl';
import { IUnleashStores } from 'lib/types';
import { ICustomRole } from 'lib/types/model';
import { ICustomRoleInsert, IRoleStore } from 'lib/types/stores/role-store';
import { Logger } from '../logger';

export default class RoleService {
    private logger: Logger;

    private store: IRoleStore;

    constructor(
        { roleStore }: Pick<IUnleashStores, 'roleStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('lib/services/session-service.ts');
        this.store = roleStore;
    }

    async getAll(): Promise<ICustomRole[]> {
        return this.store.getAll();
    }

    async get(id: number): Promise<ICustomRole> {
        return this.store.get(id);
    }

    async create(role: ICustomRoleInsert): Promise<ICustomRole> {
        return this.store.create(role);
    }

    async delete(id: number): Promise<void> {
        return this.store.delete(id);
    }
}
