import { tagSchema } from './tag-schema';
import NameExistsError from '../error/name-exists-error';
import { TAG_CREATED, TAG_DELETED } from '../types/events';
import { Logger } from '../logger';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { ITagStore } from '../types/stores/tag-store';
import { IEventStore } from '../types/stores/event-store';
import { ITag } from '../types/model';

export default class TagService {
    private tagStore: ITagStore;

    private eventStore: IEventStore;

    private logger: Logger;

    constructor(
        {
            tagStore,
            eventStore,
        }: Pick<IUnleashStores, 'tagStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.tagStore = tagStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/tag-service.js');
    }

    async getTags(): Promise<ITag[]> {
        return this.tagStore.getAll();
    }

    async getTagsByType(type: string): Promise<ITag[]> {
        return this.tagStore.getTagsByType(type);
    }

    async getTag({ type, value }: ITag): Promise<ITag> {
        return this.tagStore.getTag(type, value);
    }

    async validateUnique(tag: ITag): Promise<void> {
        const exists = await this.tagStore.exists(tag);
        if (exists) {
            throw new NameExistsError(`A tag of ${tag} already exists`);
        }
    }

    async validate(tag: ITag): Promise<ITag> {
        const data = (await tagSchema.validateAsync(tag)) as ITag;
        await this.validateUnique(tag);
        return data;
    }

    async createTag(tag: ITag, userName: string): Promise<ITag> {
        const data = await this.validate(tag);
        await this.tagStore.createTag(data);
        await this.eventStore.store({
            type: TAG_CREATED,
            createdBy: userName,
            data,
        });

        return data;
    }

    async deleteTag(tag: ITag, userName: string): Promise<void> {
        await this.tagStore.delete(tag);
        await this.eventStore.store({
            type: TAG_DELETED,
            createdBy: userName,
            data: tag,
        });
    }
}

module.exports = TagService;
