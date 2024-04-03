import type { IUnleashConfig, IUnleashStores } from '../types';
import type { Logger } from '../logger';
import type { IPatStore } from '../types/stores/pat-store';
import { PAT_CREATED, PAT_DELETED } from '../types/events';
import crypto from 'crypto';
import type { IUser } from '../types/user';
import BadDataError from '../error/bad-data-error';
import NameExistsError from '../error/name-exists-error';
import { OperationDeniedError } from '../error/operation-denied-error';
import { PAT_LIMIT } from '../util/constants';
import type EventService from '../features/events/event-service';
import type { CreatePatSchema, PatSchema } from '../openapi';
import { extractUserIdFromUser, extractUsernameFromUser } from '../util';

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
        byUser: IUser,
    ): Promise<PatSchema> {
        await this.validatePat(pat, forUserId);

        const secret = this.generateSecretKey();
        const newPat = await this.patStore.create(pat, secret, forUserId);

        await this.eventService.storeEvent({
            type: PAT_CREATED,
            createdBy: extractUsernameFromUser(byUser),
            createdByUserId: extractUserIdFromUser(byUser),
            data: { ...pat, secret: '***' },
        });

        return { ...newPat, secret };
    }

    async getAll(userId: number): Promise<PatSchema[]> {
        return this.patStore.getAllByUser(userId);
    }

    async deletePat(
        id: number,
        forUserId: number,
        byUser: IUser,
    ): Promise<void> {
        const pat = await this.patStore.get(id);

        await this.eventService.storeEvent({
            type: PAT_DELETED,
            createdBy: extractUsernameFromUser(byUser),
            createdByUserId: extractUserIdFromUser(byUser),
            data: { ...pat, secret: '***' },
        });

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

module.exports = PatService;
