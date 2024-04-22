import NameExistsError from '../../error/name-exists-error';

import { tagTypeSchema } from '../../services/tag-type-schema';

import type { IUnleashStores } from '../../types/stores';
import {
    TagTypeCreatedEvent,
    TagTypeDeletedEvent,
    TagTypeUpdatedEvent,
} from '../../types/events';

import type { Logger } from '../../logger';
import type { ITagType, ITagTypeStore } from './tag-type-store-type';
import type { IUnleashConfig } from '../../types/option';
import type EventService from '../events/event-service';
import type { IAuditUser } from '../../types';

export default class TagTypeService {
    private tagTypeStore: ITagTypeStore;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        { tagTypeStore }: Pick<IUnleashStores, 'tagTypeStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.tagTypeStore = tagTypeStore;
        this.eventService = eventService;
        this.logger = getLogger('services/tag-type-service.js');
    }

    async getAll(): Promise<ITagType[]> {
        return this.tagTypeStore.getAll();
    }

    async getTagType(name: string): Promise<ITagType> {
        return this.tagTypeStore.get(name);
    }

    async createTagType(
        newTagType: ITagType,
        auditUser: IAuditUser,
    ): Promise<ITagType> {
        const data = (await tagTypeSchema.validateAsync(
            newTagType,
        )) as ITagType;
        await this.validateUnique(data.name);
        await this.tagTypeStore.createTagType(data);
        await this.eventService.storeEvent(
            new TagTypeCreatedEvent({
                auditUser,
                data,
            }),
        );
        return data;
    }

    async validateUnique(name: string): Promise<boolean> {
        const exists = await this.tagTypeStore.exists(name);
        if (exists) {
            throw new NameExistsError(
                `There already exists a tag-type with the name ${name}`,
            );
        }
        return Promise.resolve(true);
    }

    async validate(tagType: Partial<ITagType> | undefined): Promise<void> {
        await tagTypeSchema.validateAsync(tagType);
        if (tagType?.name) {
            await this.validateUnique(tagType.name);
        }
    }

    async deleteTagType(name: string, auditUser: IAuditUser): Promise<void> {
        const tagType = await this.tagTypeStore.get(name);
        await this.tagTypeStore.delete(name);
        await this.eventService.storeEvent(
            new TagTypeDeletedEvent({
                preData: tagType,
                auditUser,
            }),
        );
    }

    async updateTagType(
        updatedTagType: ITagType,
        auditUser: IAuditUser,
    ): Promise<ITagType> {
        const data = await tagTypeSchema.validateAsync(updatedTagType);
        await this.tagTypeStore.updateTagType(data);
        await this.eventService.storeEvent(
            new TagTypeUpdatedEvent({
                data,
                auditUser,
            }),
        );
        return data;
    }
}

module.exports = TagTypeService;
