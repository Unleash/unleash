import { Logger } from '../logger';
import { IUser } from '../types/user';
import { IUnleashConfig } from '../types/option';
import { IAccountStore, IUnleashStores } from '../types/stores';
import { minutesToMilliseconds } from 'date-fns';
import { AccessService } from './access-service';
import { RoleName } from '../types/model';
import { IAdminCount } from 'lib/types/stores/account-store';

interface IUserWithRole extends IUser {
    rootRole: number;
}

export class AccountService {
    private logger: Logger;

    private store: IAccountStore;

    private accessService: AccessService;

    private seenTimer: NodeJS.Timeout;

    private lastSeenSecrets: Set<string> = new Set<string>();

    constructor(
        stores: Pick<IUnleashStores, 'accountStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        services: {
            accessService: AccessService;
        },
    ) {
        this.logger = getLogger('service/account-service.ts');
        this.store = stores.accountStore;
        this.accessService = services.accessService;
        this.updateLastSeen();
    }

    async getAll(): Promise<IUserWithRole[]> {
        const accounts = await this.store.getAll();
        const defaultRole = await this.accessService.getRootRole(
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
        return this.store.getAccountByPersonalAccessToken(secret);
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

        this.seenTimer = setTimeout(
            async () => this.updateLastSeen(),
            minutesToMilliseconds(3),
        ).unref();
    }

    addPATSeen(secret: string): void {
        this.lastSeenSecrets.add(secret);
    }

    destroy(): void {
        clearTimeout(this.seenTimer);
        this.seenTimer = null;
    }
}
