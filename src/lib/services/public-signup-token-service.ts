import crypto from 'crypto';
import { Logger } from '../logger';
import { IUnleashConfig, IUnleashStores } from '../types';
import { minutesToMilliseconds } from 'date-fns';
import { IPublicSignupTokenStore } from '../types/stores/public-signup-token-store';
import { PublicSignupTokenSchema } from '../openapi/spec/public-signup-token-schema';
import { IRoleStore } from '../types/stores/role-store';
import { IPublicSignupTokenCreate } from '../types/models/public-signup-token';
import { PublicSignupTokenCreateSchema } from '../openapi/spec/public-signup-token-create-schema';
import { RoleName } from '../types/model';
import { IEventStore } from '../types/stores/event-store';

export class PublicSignupTokenService {
    private store: IPublicSignupTokenStore;

    private roleStore: IRoleStore;

    private eventStore: IEventStore;

    private logger: Logger;

    private timer: NodeJS.Timeout;

    private activeTokens: PublicSignupTokenSchema[] = [];

    constructor(
        {
            publicSignupTokenStore,
            roleStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            'publicSignupTokenStore' | 'roleStore' | 'eventStore'
        >,
        config: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
    ) {
        this.store = publicSignupTokenStore;
        this.roleStore = roleStore;
        this.eventStore = eventStore;
        this.logger = config.getLogger(
            '/services/public-signup-token-service.ts',
        );
        this.fetchActiveTokens();
        this.timer = setInterval(
            () => this.fetchActiveTokens(),
            minutesToMilliseconds(1),
        ).unref();
    }

    async fetchActiveTokens(): Promise<void> {
        this.activeTokens = await this.getAllActiveTokens();
    }

    public async get(secret: string): Promise<PublicSignupTokenSchema> {
        return this.store.get(secret);
    }

    public async getAllTokens(): Promise<PublicSignupTokenSchema[]> {
        return this.store.getAll();
    }

    public async getAllActiveTokens(): Promise<PublicSignupTokenSchema[]> {
        return this.store.getAllActive();
    }

    public async setExpiry(
        secret: string,
        expireAt: Date,
    ): Promise<PublicSignupTokenSchema> {
        return this.store.setExpiry(secret, expireAt);
    }

    public async addTokenUser(secret: string, userId: number): Promise<void> {
        return this.store.addTokenUser(secret, userId);
    }

    public async delete(secret: string): Promise<void> {
        await this.expireToken(secret);
    }

    private async expireToken(
        secret: string,
    ): Promise<PublicSignupTokenSchema> {
        return this.store.setExpiry(secret, new Date());
    }

    public async createNewPublicSignupToken(
        tokenCreate: PublicSignupTokenCreateSchema,
        createdBy: string,
    ): Promise<PublicSignupTokenSchema> {
        const viewerRole = await this.roleStore.getRoleByName(RoleName.VIEWER);
        const newApiToken: IPublicSignupTokenCreate = {
            name: tokenCreate.name,
            expiresAt: new Date(tokenCreate.expiresAt),
            secret: this.generateSecretKey(),
            roleId: viewerRole ? viewerRole.id : -1,
            createdBy: createdBy,
        };
        const token = await this.store.insert(newApiToken);
        this.activeTokens.push(token);
        return token;
    }

    private generateSecretKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    destroy(): void {
        clearInterval(this.timer);
        this.timer = null;
    }
}
