import { tagSchema } from './tag-schema.js';
import NameExistsError from '../error/name-exists-error.js';
import {
    TagCreatedEvent,
    TagDeletedEvent,
    TagUpdatedEvent,
} from '../types/index.js';
import type { Logger } from '../logger.js';
import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { ITagStore } from '../types/stores/tag-store.js';
import type { ITag } from '../tags/index.js';
import type EventService from '../features/events/event-service.js';
import type { IAuditUser } from '../types/index.js';

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
            throw new NameExistsError(
                `A tag with type [${tag.type}] and value [${tag.value}] already exists`,
            );
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

    async renameTag(
        tag: ITag,
        newValue: string,
        auditUser: IAuditUser,
    ): Promise<ITag> {
        const existing = await this.tagStore.getTag(tag.type, tag.value);
        const renamed = (await tagSchema.validateAsync({
            type: existing.type,
            value: newValue.trim(),
        })) as ITag;
        if (renamed.value === existing.value) {
            return existing;
        }
        await this.tagStore.renameTag(existing, renamed.value);
        await this.eventService.storeEvent(
            new TagUpdatedEvent({
                data: renamed,
                preData: existing,
                auditUser,
            }),
        );

        return renamed;
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
