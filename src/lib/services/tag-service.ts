import { tagSchema } from './tag-schema';
import NameExistsError from '../error/name-exists-error';
import { TagCreatedEvent, TagDeletedEvent } from '../types/events';
import type { Logger } from '../logger';
import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { ITagStore } from '../types/stores/tag-store';
import type { ITag } from '../types/model';
import type EventService from '../features/events/event-service';
import type { IAuditUser } from '../types';

export default class TagService {
    private tagStore: ITagStore;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        { tagStore }: Pick<IUnleashStores, 'tagStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.tagStore = tagStore;
        this.eventService = eventService;
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

    async createTag(tag: ITag, auditUser: IAuditUser): Promise<ITag> {
        const trimmedTag = {
            ...tag,
            value: tag.value.trim(),
        };
        const data = await this.validate(trimmedTag);
        await this.tagStore.createTag(data);
        await this.eventService.storeEvent(
            new TagCreatedEvent({
                data,
                auditUser,
            }),
        );

        return data;
    }

    async deleteTag(tag: ITag, auditUser: IAuditUser): Promise<void> {
        await this.tagStore.delete(tag);
        await this.eventService.storeEvent(
            new TagDeletedEvent({
                data: tag,
                auditUser,
            }),
        );
    }
}

module.exports = TagService;
