import type { IUser } from '../types/user.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IAccountStore, IUnleashStores } from '../types/stores.js';
import type { AccessService } from './access-service.js';
import { RoleName } from '../types/model.js';
import type { IAdminCount } from '../types/stores/account-store.js';
import { NotFoundError } from '../error/index.js';
import type { Logger } from '../logger.js';
import type { AccountAccessCredential } from '../authentication/authorization-token.js';
import type { AccountTokenReference } from '../types/stores/account-store.js';
import { verifyToken } from '../authentication/token-verifier.js';

interface IUserWithRole extends IUser {
    rootRole: number;
}

export class AccountService {
    private logger: Logger;

    private store: IAccountStore;

    private accessService: AccessService;

    private lastSeenTokens: Map<string, AccountTokenReference> = new Map();

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

    async authenticateAccountByToken(
        credential: AccountAccessCredential,
    ): Promise<IUser> {
        const account =
            credential.version === 'v2'
                ? await this.getAccountForSecureToken(credential)
                : await this.store.getAccountByPersonalAccessToken(
                      credential.secret,
                  );
        if (account === undefined) {
            throw new NotFoundError();
        }
        this.addAccountTokenSeen(
            credential.version === 'v2'
                ? { version: 'v2', selector: credential.selector }
                : { version: 'v1', secret: credential.secret },
        );
        return account;
    }

    async getAdminCount(): Promise<IAdminCount> {
        return this.store.getAdminCount();
    }

    async updateLastSeen(): Promise<void> {
        if (this.lastSeenTokens.size > 0) {
            const toStore = [...this.lastSeenTokens.values()];
            this.lastSeenTokens = new Map();
            await this.store.markSeenAt(toStore);
        }
    }

    private async getAccountForSecureToken(
        credential: Extract<AccountAccessCredential, { version: 'v2' }>,
    ): Promise<IUser | undefined> {
        const token = await this.store.getAccountByTokenSelector(
            credential.selector,
        );
        if (!token || !verifyToken(credential.secret, token.verifier)) {
            return undefined;
        }
        return token.account;
    }

    private addAccountTokenSeen(token: AccountTokenReference): void {
        const key = token.version === 'v2' ? token.selector : token.secret;
        this.lastSeenTokens.set(key, token);
    }
}
