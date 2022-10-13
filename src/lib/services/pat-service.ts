import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IPatStore } from '../types/stores/pat-store';
import { IEventStore } from '../types/stores/event-store';
import { PAT_CREATED } from '../types/events';
import { IPat } from '../types/models/pat';
import crypto from 'crypto';
import User from '../types/user';
import BadDataError from '../error/bad-data-error';
import NameExistsError from '../error/name-exists-error';

export default class PatService {
    private config: IUnleashConfig;

    private logger: Logger;

    private patStore: IPatStore;

    private eventStore: IEventStore;

    constructor(
        {
            patStore,
            eventStore,
        }: Pick<IUnleashStores, 'patStore' | 'eventStore'>,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/pat-service.ts');
        this.patStore = patStore;
        this.eventStore = eventStore;
    }

    async createPat(pat: IPat, user: User): Promise<IPat> {
        await this.validatePat(pat, user.id);
        pat.secret = this.generateSecretKey();
        pat.userId = user.id;
        const newPat = await this.patStore.create(pat);

        pat.secret = '***';
        await this.eventStore.store({
            type: PAT_CREATED,
            createdBy: user.email || user.username,
            data: pat,
        });

        return newPat;
    }

    async getAll(user: User): Promise<IPat[]> {
        return this.patStore.getAllByUser(user.id);
    }

    async deletePat(id: number, userId: number): Promise<void> {
        return this.patStore.deleteForUser(id, userId);
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
