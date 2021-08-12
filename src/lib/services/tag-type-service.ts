import NameExistsError from '../error/name-exists-error';

import { tagTypeSchema } from './tag-type-schema';

import { IUnleashStores } from '../types/stores';
import {
    TAG_TYPE_CREATED,
    TAG_TYPE_DELETED,
    TAG_TYPE_UPDATED,
} from '../types/events';

import { Logger } from '../logger';
import { ITagType, ITagTypeStore } from '../types/stores/tag-type-store';
import { IEventStore } from '../types/stores/event-store';
import { IUnleashConfig } from '../types/option';

export default class TagTypeService {
    private tagTypeStore: ITagTypeStore;

    private eventStore: IEventStore;

    private logger: Logger;

    constructor(
        {
            tagTypeStore,
            eventStore,
        }: Pick<IUnleashStores, 'tagTypeStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.tagTypeStore = tagTypeStore;
        this.eventStore = eventStore;
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
        userName: string,
    ): Promise<ITagType> {
        const data = (await tagTypeSchema.validateAsync(
            newTagType,
        )) as ITagType;
        await this.validateUnique(data);
        await this.tagTypeStore.createTagType(data);
        await this.eventStore.store({
            type: TAG_TYPE_CREATED,
            createdBy: userName || 'unleash-system',
            data,
        });
        return data;
    }

    async validateUnique({ name }: Pick<ITagType, 'name'>): Promise<boolean> {
        const exists = await this.tagTypeStore.exists(name);
        if (exists) {
            throw new NameExistsError(
                `There already exists a tag-type with the name ${name}`,
            );
        }
        return Promise.resolve(true);
    }

    async validate(tagType: ITagType): Promise<void> {
        await tagTypeSchema.validateAsync(tagType);
        await this.validateUnique(tagType);
    }

    async deleteTagType(name: string, userName: string): Promise<void> {
        await this.tagTypeStore.delete(name);
        await this.eventStore.store({
            type: TAG_TYPE_DELETED,
            createdBy: userName || 'unleash-system',
            data: { name },
        });
    }

    async updateTagType(
        updatedTagType: ITagType,
        userName: string,
    ): Promise<ITagType> {
        const data = await tagTypeSchema.validateAsync(updatedTagType);
        await this.tagTypeStore.updateTagType(data);
        await this.eventStore.store({
            type: TAG_TYPE_UPDATED,
            createdBy: userName || 'unleash-system',
            data,
        });
        return data;
    }
}

module.exports = TagTypeService;
