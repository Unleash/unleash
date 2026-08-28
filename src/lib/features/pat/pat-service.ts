import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    PatCreatedEvent,
    PatDeletedEvent,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type { AccountTokenForAudit, IPatStore } from './pat-store-type.js';
import { getTokenExpiryWarning } from './token-expiry-warning.js';
import crypto from 'crypto';
import BadDataError from '../../error/bad-data-error.js';
import NameExistsError from '../../error/name-exists-error.js';
import { OperationDeniedError } from '../../error/operation-denied-error.js';
import { PAT_LIMIT } from '../../util/constants.js';
import type EventService from '../events/event-service.js';
import type { CreatePatSchema, PatSchema } from '../../openapi/index.js';
import type { PersistedAccountTokenCredential } from './pat-store-type.js';
import {
    AuthorizationTokenKind,
    createTokenV2Credential,
} from '../../authentication/authorization-token.js';

export type CreatedAccountToken = AccountTokenForAudit & {
    secret: string;
};

type PatAuditData = Pick<PatSchema, 'id' | 'description' | 'expiresAt'> & {
    secure: boolean;
    selector?: string;
};

export default class PatService {
    private config: IUnleashConfig;

    private logger: Logger;

    private patStore: IPatStore;

    private eventService: EventService;

    constructor(
        { patStore }: Pick<IUnleashStores, 'patStore'>,
        config: IUnleashConfig,
        eventService: EventService,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/pat-service.ts');
        this.patStore = patStore;
        this.eventService = eventService;
    }

    async createPat(
        pat: CreatePatSchema,
        ownerId: number,
        auditUser: IAuditUser,
    ): Promise<PatSchema> {
        const createdToken = await this.createAccountToken(pat, ownerId);

        await this.eventService.storeEvent(
            new PatCreatedEvent({
                data: this.toAuditData(createdToken),
                auditUser,
            }),
        );

        const {
            selector: _selector,
            secure: _secure,
            ...publicToken
        } = createdToken;
        return publicToken;
    }

    async createAccountToken(
        token: CreatePatSchema,
        ownerId: number,
    ): Promise<CreatedAccountToken> {
        await this.validatePat(token, ownerId);

        const secure = this.config.flagResolver.isEnabled(
            'secureAccountTokenStorage',
        );
        const { credential, secret } = this.generateToken(secure);
        const newPat = await this.patStore.create(token, credential, ownerId);

        return credential.selector
            ? {
                  ...newPat,
                  secret,
                  secure: true,
                  selector: credential.selector,
              }
            : { ...newPat, secret, secure: false };
    }

    async getAll(
        ownerId: number,
        clockOverride: Date = new Date(),
    ): Promise<PatSchema[]> {
        const tokens = await this.patStore.getAllByUser(ownerId);
        if (!this.config.flagResolver.isEnabled('tokenExpiryNotifications')) {
            return tokens;
        }
        return tokens.map((token) => ({
            ...token,
            expiryWarning: getTokenExpiryWarning({
                createdAt: new Date(token.createdAt),
                expiresAt: new Date(token.expiresAt),
                leadTimeDays: this.config.tokenExpiryNotificationDays,
                now: clockOverride,
            }),
        }));
    }

    async deletePat(
        id: number,
        ownerId: number,
        auditUser: IAuditUser,
    ): Promise<void> {
        const deletedToken = await this.deleteAccountToken(id, ownerId);
        if (!deletedToken) {
            return;
        }

        await this.eventService.storeEvent(
            new PatDeletedEvent({
                data: this.toAuditData(deletedToken),
                auditUser,
            }),
        );
    }

    async deleteAccountToken(
        id: number,
        ownerId: number,
    ): Promise<AccountTokenForAudit | undefined> {
        return this.patStore.deleteForUser(id, ownerId);
    }

    async validatePat(
        { description, expiresAt }: CreatePatSchema,
        ownerId: number,
    ): Promise<void> {
        if (!description) {
            throw new BadDataError('PAT description cannot be empty.');
        }

        if (new Date(expiresAt) < new Date()) {
            throw new BadDataError('The expiry date should be in future.');
        }

        if ((await this.patStore.countByUser(ownerId)) >= PAT_LIMIT) {
            throw new OperationDeniedError(
                `Too many PATs (${PAT_LIMIT}) already exist for this user.`,
            );
        }

        if (
            await this.patStore.existsWithDescriptionByUser(
                description,
                ownerId,
            )
        ) {
            throw new NameExistsError('PAT description already exists.');
        }
    }

    private generateToken(secure: boolean): {
        secret: string;
        credential: PersistedAccountTokenCredential;
    } {
        if (secure) {
            const credential = createTokenV2Credential({
                kind: AuthorizationTokenKind.ACCOUNT_ACCESS,
            });
            return {
                secret: credential.secret,
                credential: {
                    selector: credential.selector,
                    verifier: credential.verifier,
                },
            };
        }

        const randomStr = crypto.randomBytes(28).toString('hex');
        const secret = `user:${randomStr}`;
        return {
            secret,
            credential: { secret },
        };
    }

    private toAuditData(
        token: AccountTokenForAudit | CreatedAccountToken,
    ): PatAuditData {
        return {
            id: token.id,
            description: token.description,
            expiresAt: token.expiresAt,
            secure: token.secure,
            ...(token.selector ? { selector: token.selector } : {}),
        };
    }
}
