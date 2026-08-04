import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    PatCreatedEvent,
    PatDeletedEvent,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type { IPatStore } from './pat-store-type.js';
import { getTokenExpiryWarning } from './token-expiry-warning.js';
import crypto from 'crypto';
import BadDataError from '../../error/bad-data-error.js';
import NameExistsError from '../../error/name-exists-error.js';
import { OperationDeniedError } from '../../error/operation-denied-error.js';
import { PAT_LIMIT } from '../../util/constants.js';
import type EventService from '../events/event-service.js';
import type { CreatePatSchema, PatSchema } from '../../openapi/index.js';

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
        forUserId: number,
        auditUser: IAuditUser,
    ): Promise<PatSchema> {
        await this.validatePat(pat, forUserId);

        const secret = this.generateSecretKey();
        const newPat = await this.patStore.create(pat, secret, forUserId);

        await this.eventService.storeEvent(
            new PatCreatedEvent({
                data: { ...pat, secret: '***' },
                auditUser,
            }),
        );

        return { ...newPat, secret };
    }

    async getAll(
        userId: number,
        clockOverride: Date = new Date(),
    ): Promise<PatSchema[]> {
        const tokens = await this.patStore.getAllByUser(userId);
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
        forUserId: number,
        auditUser: IAuditUser,
    ): Promise<void> {
        const pat = await this.patStore.get(id);

        await this.eventService.storeEvent(
            new PatDeletedEvent({
                data: { ...pat, secret: '***' },
                auditUser,
            }),
        );

        return this.patStore.deleteForUser(id, forUserId);
    }

    async validatePat(
        { description, expiresAt }: CreatePatSchema,
        userId: number,
    ): Promise<void> {
        if (!description) {
            throw new BadDataError('PAT description cannot be empty.');
        }

        if (new Date(expiresAt) < new Date()) {
            throw new BadDataError('The expiry date should be in future.');
        }

        if ((await this.patStore.countByUser(userId)) >= PAT_LIMIT) {
            throw new OperationDeniedError(
                `Too many PATs (${PAT_LIMIT}) already exist for this user.`,
            );
        }

        if (
            await this.patStore.existsWithDescriptionByUser(description, userId)
        ) {
            throw new NameExistsError('PAT description already exists.');
        }
    }

    private generateSecretKey() {
        const randomStr = crypto.randomBytes(28).toString('hex');
        return `user:${randomStr}`;
    }
}
