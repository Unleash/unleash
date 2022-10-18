import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { SUGGEST_CHANGE_CREATED } from '../types/events';
import User from '../types/user';
import { ISuggestChangeStore } from '../types/stores/suggest-change-store';
import { ISuggestChangeSet } from '../types/model';

export default class SuggestChangeService {
    private config: IUnleashConfig;

    private logger: Logger;

    private suggestChangeStore: ISuggestChangeStore;

    private eventStore: IEventStore;

    constructor(
        {
            suggestChangeStore,
            eventStore,
        }: Pick<IUnleashStores, 'suggestChangeStore' | 'eventStore'>,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/suggest-change-service.ts');
        this.suggestChangeStore = suggestChangeStore;
        this.eventStore = eventStore;
    }

    async createChangeRequest(
        changeSet: ISuggestChangeSet,
        user: User,
    ): Promise<ISuggestChangeSet> {
        const newChangeRequest = await this.suggestChangeStore.create(
            changeSet,
            user,
        );

        await this.eventStore.store({
            type: SUGGEST_CHANGE_CREATED,
            createdBy: user.email || user.username,
            data: newChangeRequest,
        });

        return newChangeRequest;
    }

    async getAll(): Promise<ISuggestChangeSet[]> {
        return this.suggestChangeStore.getAll();
    }

    async get(id: number): Promise<ISuggestChangeSet> {
        return this.suggestChangeStore.get(id);
    }

    async delete(id: number): Promise<void> {
        return this.suggestChangeStore.delete(id);
    }
}

module.exports = SuggestChangeService;
