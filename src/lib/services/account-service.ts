import { Logger } from '../logger';
import { AccessService } from './access-service';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { RoleName } from '../types/model';
import { minutesToMilliseconds } from 'date-fns';
import { IAccountStore } from '../types/stores/account-store';
import { IAccount, IAccountWithRole } from 'lib/types/account';

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
        this.logger = getLogger('services/account-service.ts');
        this.store = stores.accountStore;
        this.accessService = services.accessService;
        this.updateLastSeen();
    }

    async getAll(): Promise<IAccountWithRole[]> {
        const accounts = await this.store.getAll();
        const defaultRole = await this.accessService.getRootRole(
            RoleName.VIEWER,
        );

        const accountRoles =
            await this.accessService.getRootRoleForAllAccounts();

        return accounts.map((account) => {
            const rootRole = accountRoles.find(
                (role) => role.accountId === account.id,
            );
            const roleId = rootRole ? rootRole.roleId : defaultRole.id;
            return { ...account, roleId };
        });
    }

    async getAccountByPersonalAccessToken(secret: string): Promise<IAccount> {
        return this.store.getAccountByPersonalAccessToken(secret);
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
