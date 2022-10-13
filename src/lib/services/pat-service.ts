import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IPatStore } from '../types/stores/pat-store';
import { IEventStore } from '../types/stores/event-store';
import { PAT_CREATED } from '../types/events';
import { IPat } from '../types/models/pat';
import crypto from 'crypto';
import User from '../types/user';

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
        if (new Date(pat.expiresAt) < new Date()) {
            throw new Error('The expiry date should be in future.');
        }
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

    private generateSecretKey() {
        const randomStr = crypto.randomBytes(28).toString('hex');
        return `user:${randomStr}`;
    }
}

module.exports = PatService;
