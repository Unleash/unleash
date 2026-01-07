import type { IUser } from '../types/user.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IAccountStore, IUnleashStores } from '../types/stores.js';
import type { AccessService } from './access-service.js';
import { RoleName } from '../types/model.js';
import type { IAdminCount } from '../types/stores/account-store.js';
import { NotFoundError } from '../error/index.js';
import type { Logger } from '../logger.js';

interface IUserWithRole extends IUser {
    rootRole: number;
}

export class AccountService {
    private logger: Logger;

    private store: IAccountStore;

    private accessService: AccessService;

    private lastSeenSecrets: Set<string> = new Set<string>();

    constructor(
        stores: Pick<IUnleashStores, 'accountStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        services: {
            accessService: AccessService;
        },
    ) {
        this.logger = getLogger('service/account-service.ts');
        this.store = stores.accountStore;
        this.accessService = services.accessService;
    }

    async getAll(): Promise<IUserWithRole[]> {
        this.logger.debug('getAll');
        const accounts = await this.store.getAll();
        const defaultRole = await this.accessService.getPredefinedRole(
            RoleName.VIEWER,
        );
        const userRoles = await this.accessService.getRootRoleForAllUsers();
        const accountsWithRootRole = accounts.map((u) => {
            const rootRole = userRoles.find((r) => r.userId === u.id);
            const roleId = rootRole ? rootRole.roleId : defaultRole.id;
            return { ...u, rootRole: roleId };
        });
        return accountsWithRootRole;
    }

    async getAccountByPersonalAccessToken(secret: string): Promise<IUser> {
        const account =
            await this.store.getAccountByPersonalAccessToken(secret);
        if (account === undefined) {
            throw new NotFoundError();
        }
        return account;
    }

    async getAdminCount(): Promise<IAdminCount> {
        return this.store.getAdminCount();
    }

    async updateLastSeen(): Promise<void> {
        if (this.lastSeenSecrets.size > 0) {
            const toStore = [...this.lastSeenSecrets];
            this.lastSeenSecrets = new Set<string>();
            await this.store.markSeenAt(toStore);
        }
    }

    addPATSeen(secret: string): void {
        this.lastSeenSecrets.add(secret);
    }
}
