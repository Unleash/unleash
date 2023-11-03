import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IPatStore } from '../types/stores/pat-store';
import { PAT_CREATED, PAT_DELETED } from '../types/events';
import { IPat } from '../types/models/pat';
import crypto from 'crypto';
import { IUser } from '../types/user';
import BadDataError from '../error/bad-data-error';
import NameExistsError from '../error/name-exists-error';
import { OperationDeniedError } from '../error/operation-denied-error';
import { PAT_LIMIT } from '../util/constants';
import EventService from './event-service';

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
        pat: IPat,
        forUserId: number,
        editor: IUser,
    ): Promise<IPat> {
        await this.validatePat(pat, forUserId);
        pat.secret = this.generateSecretKey();
        pat.userId = forUserId;
        const newPat = await this.patStore.create(pat);

        pat.secret = '***';
        await this.eventService.storeEvent({
            type: PAT_CREATED,
            createdBy: editor.email || editor.username,
            data: pat,
        });

        return newPat;
    }

    async getAll(userId: number): Promise<IPat[]> {
        return this.patStore.getAllByUser(userId);
    }

    async deletePat(
        id: number,
        forUserId: number,
        editor: IUser,
    ): Promise<void> {
        const pat = await this.patStore.get(id);

        pat.secret = '***';
        await this.eventService.storeEvent({
            type: PAT_DELETED,
            createdBy: editor.email || editor.username,
            data: pat,
        });

        return this.patStore.deleteForUser(id, forUserId);
    }

    async validatePat(
        { description, expiresAt }: IPat,
        userId: number,
    ): Promise<void> {
        if (!description) {
            throw new BadDataError('PAT description cannot be empty');
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
            throw new NameExistsError('PAT description already exists');
        }
    }

    private generateSecretKey() {
        const randomStr = crypto.randomBytes(28).toString('hex');
        return `user:${randomStr}`;
    }
}

module.exports = PatService;
