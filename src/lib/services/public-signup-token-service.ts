import crypto from 'node:crypto';
import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    SYSTEM_USER_AUDIT,
} from '../types/index.js';
import type { IPublicSignupTokenStore } from '../types/stores/public-signup-token-store.js';
import type { PublicSignupTokenSchema } from '../openapi/spec/public-signup-token-schema.js';
import type { IRoleStore } from '../types/stores/role-store.js';
import type { IPublicSignupTokenCreate } from '../types/models/public-signup-token.js';
import type { PublicSignupTokenCreateSchema } from '../openapi/spec/public-signup-token-create-schema.js';
import type { CreateInvitedUserSchema } from '../openapi/spec/create-invited-user-schema.js';
import { RoleName } from '../types/model.js';
import {
    PublicSignupTokenCreatedEvent,
    PublicSignupTokenUpdatedEvent,
    PublicSignupTokenUserAddedEvent,
} from '../types/index.js';
import type UserService from './user-service.js';
import type { IUser } from '../types/user.js';
import { URL } from 'url';
import { add } from 'date-fns';
import type EventService from '../features/events/event-service.js';
import { NotFoundError } from '../error/index.js';

export class PublicSignupTokenService {
    private store: IPublicSignupTokenStore;

    private roleStore: IRoleStore;

    private userService: UserService;

    private eventService: EventService;

    private readonly unleashBase: string;

    constructor(
        {
            publicSignupTokenStore,
            roleStore,
        }: Pick<IUnleashStores, 'publicSignupTokenStore' | 'roleStore'>,
        config: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'server'>,
        userService: UserService,
        eventService: EventService,
    ) {
        this.store = publicSignupTokenStore;
        this.userService = userService;
        this.eventService = eventService;
        this.roleStore = roleStore;
        this.unleashBase = config.server.unleashUrl;
    }

    private getUrl(secret: string): string {
        return new URL(
            `${this.unleashBase}/new-user?invite=${secret}`,
        ).toString();
    }

    public async get(secret: string): Promise<PublicSignupTokenSchema> {
        const token = await this.store.get(secret);
        if (token === undefined) {
            throw new NotFoundError('Could not find token with that secret');
        }
        return token;
    }

    public async getAllTokens(): Promise<PublicSignupTokenSchema[]> {
        return this.store.getAll();
    }

    public async validate(secret: string): Promise<boolean> {
        return this.store.isValid(secret);
    }

    public async update(
        secret: string,
        { expiresAt, enabled }: { expiresAt?: Date; enabled?: boolean },
        auditUser: IAuditUser,
    ): Promise<PublicSignupTokenSchema> {
        const result = await this.store.update(secret, { expiresAt, enabled });
        await this.eventService.storeEvent(
            new PublicSignupTokenUpdatedEvent({
                auditUser,
                data: { secret, enabled, expiresAt },
            }),
        );
        return result;
    }

    public async addTokenUser(
        secret: string,
        createUser: CreateInvitedUserSchema,
        auditUser: IAuditUser,
    ): Promise<IUser> {
        const token = await this.get(secret);
        if (token === undefined) {
            throw new NotFoundError('Could not find token with that secret');
        }
        const user = await this.userService.createUser(
            {
                ...createUser,
                rootRole: token.role.id,
            },
            auditUser,
        );
        await this.store.addTokenUser(secret, user.id);
        await this.eventService.storeEvent(
            new PublicSignupTokenUserAddedEvent({
                auditUser: SYSTEM_USER_AUDIT,
                data: { secret, userId: user.id },
            }),
        );
        return user;
    }

    public async createNewPublicSignupToken(
        tokenCreate: PublicSignupTokenCreateSchema,
        auditUser: IAuditUser,
    ): Promise<PublicSignupTokenSchema> {
        const viewerRole = await this.roleStore.getRoleByName(RoleName.VIEWER);
        const secret = this.generateSecretKey();
        const url = this.getUrl(secret);
        const cappedDate = this.getMinimumDate(
            new Date(tokenCreate.expiresAt),
            add(new Date(), { months: 1 }),
        );
        const newToken: IPublicSignupTokenCreate = {
            name: tokenCreate.name,
            expiresAt: cappedDate,
            secret: secret,
            roleId: viewerRole ? viewerRole.id : -1,
            createdBy: auditUser.username,
            url: url,
        };
        const token = await this.store.insert(newToken);

        await this.eventService.storeEvent(
            new PublicSignupTokenCreatedEvent({
                auditUser,
                data: token,
            }),
        );
        return token;
    }

    private generateSecretKey(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    private getMinimumDate(date1: Date, date2: Date): Date {
        return date1 < date2 ? date1 : date2;
    }
}
