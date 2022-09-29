import crypto from 'crypto';
import { Logger } from '../logger';
import { IUnleashConfig, IUnleashStores } from '../types';
import { IPublicSignupTokenStore } from '../types/stores/public-signup-token-store';
import { PublicSignupTokenSchema } from '../openapi/spec/public-signup-token-schema';
import { IRoleStore } from '../types/stores/role-store';
import { IPublicSignupTokenCreate } from '../types/models/public-signup-token';
import { PublicSignupTokenCreateSchema } from '../openapi/spec/public-signup-token-create-schema';
import { CreateInvitedUserSchema } from 'lib/openapi/spec/create-invited-user-schema';
import { RoleName } from '../types/model';
import { IEventStore } from '../types/stores/event-store';
import {
    PublicSignupTokenCreatedEvent,
    PublicSignupTokenUpdatedEvent,
    PublicSignupTokenUserAddedEvent,
} from '../types/events';
import UserService from './user-service';
import { IUser } from '../types/user';
import { URL } from 'url';

export class PublicSignupTokenService {
    private store: IPublicSignupTokenStore;

    private roleStore: IRoleStore;

    private eventStore: IEventStore;

    private userService: UserService;

    private logger: Logger;

    private timer: NodeJS.Timeout;

    private readonly unleashBase: string;

    constructor(
        {
            publicSignupTokenStore,
            roleStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            'publicSignupTokenStore' | 'roleStore' | 'eventStore'
        >,
        config: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'server'>,
        userService: UserService,
    ) {
        this.store = publicSignupTokenStore;
        this.userService = userService;
        this.roleStore = roleStore;
        this.eventStore = eventStore;
        this.logger = config.getLogger(
            '/services/public-signup-token-service.ts',
        );
        this.unleashBase = config.server.unleashUrl;
    }

    private getUrl(secret: string): string {
        return new URL(
            `${this.unleashBase}/new-user?invite=${secret}`,
        ).toString();
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

    public async validate(secret: string): Promise<boolean> {
        return this.store.isValid(secret);
    }

    public async update(
        secret: string,
        { expiresAt, enabled }: { expiresAt?: Date; enabled?: boolean },
        createdBy: string,
    ): Promise<PublicSignupTokenSchema> {
        const result = await this.store.update(secret, { expiresAt, enabled });
        await this.eventStore.store(
            new PublicSignupTokenUpdatedEvent({
                createdBy,
                data: { secret, enabled, expiresAt },
            }),
        );
        return result;
    }

    public async addTokenUser(
        secret: string,
        createUser: CreateInvitedUserSchema,
    ): Promise<IUser> {
        const token = await this.get(secret);
        const user = await this.userService.createUser({
            ...createUser,
            rootRole: token.role.id,
        });
        await this.store.addTokenUser(secret, user.id);
        await this.eventStore.store(
            new PublicSignupTokenUserAddedEvent({
                createdBy: 'System',
                data: { secret, userId: user.id },
            }),
        );
        return user;
    }

    public async createNewPublicSignupToken(
        tokenCreate: PublicSignupTokenCreateSchema,
        createdBy: string,
    ): Promise<PublicSignupTokenSchema> {
        const viewerRole = await this.roleStore.getRoleByName(RoleName.VIEWER);
        const secret = this.generateSecretKey();
        const url = this.getUrl(secret);
        const newToken: IPublicSignupTokenCreate = {
            name: tokenCreate.name,
            expiresAt: new Date(tokenCreate.expiresAt),
            secret: secret,
            roleId: viewerRole ? viewerRole.id : -1,
            createdBy: createdBy,
            url: url,
        };
        const token = await this.store.insert(newToken);

        await this.eventStore.store(
            new PublicSignupTokenCreatedEvent({
                createdBy: createdBy,
                data: token,
            }),
        );
        return token;
    }

    private generateSecretKey(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    destroy(): void {
        clearInterval(this.timer);
        this.timer = null;
    }
}
