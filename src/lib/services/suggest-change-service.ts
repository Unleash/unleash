import { IUnleashConfig, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { SUGGEST_CHANGE_CREATED } from '../types/events';
import User from '../types/user';
import { ISuggestChangeStore } from '../types/stores/suggest-change-store';
import { ISuggestChange, ISuggestChangeSet } from '../types/model';

export class SuggestChangeService {
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

    createChangeSetRequest = async (
        changeSet: ISuggestChangeSet,
        user: User,
    ): Promise<ISuggestChangeSet> => {
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
    };

    addChangeToChangeSet = async (
        change: ISuggestChange,
        changeSetId: number,
        user: User,
    ): Promise<ISuggestChangeSet> => {
        await this.suggestChangeStore.addChangeToSet(change, changeSetId, user);
        return this.get(changeSetId);
    };

    getAll = async (): Promise<ISuggestChangeSet[]> => {
        return this.suggestChangeStore.getAll();
    };

    get = async (id: number): Promise<ISuggestChangeSet> => {
        return this.suggestChangeStore.get(id);
    };

    delete = async (id: number): Promise<void> => {
        return this.suggestChangeStore.delete(id);
    };
}
