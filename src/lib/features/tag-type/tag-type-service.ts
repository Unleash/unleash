import NameExistsError from '../../error/name-exists-error';

import { tagTypeSchema } from '../../services/tag-type-schema';

import { IUnleashStores } from '../../types/stores';
import {
    TAG_TYPE_CREATED,
    TAG_TYPE_DELETED,
    TAG_TYPE_UPDATED,
} from '../../types/events';

import { Logger } from '../../logger';
import { ITagType, ITagTypeStore } from './tag-type-store-type';
import { IUnleashConfig } from '../../types/option';
import EventService from '../events/event-service';
import { SYSTEM_USER } from '../../types';

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
        userName: string,
        userId: number,
    ): Promise<ITagType> {
        const data = (await tagTypeSchema.validateAsync(
            newTagType,
        )) as ITagType;
        await this.validateUnique(data.name);
        await this.tagTypeStore.createTagType(data);
        await this.eventService.storeEvent({
            type: TAG_TYPE_CREATED,
            createdBy: userName || SYSTEM_USER.username,
            createdByUserId: userId,
            data,
        });
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

    async deleteTagType(
        name: string,
        userName: string,
        userId: number,
    ): Promise<void> {
        const tagType = await this.tagTypeStore.get(name);
        await this.tagTypeStore.delete(name);
        await this.eventService.storeEvent({
            type: TAG_TYPE_DELETED,
            createdBy: userName || SYSTEM_USER.username,
            createdByUserId: userId,
            preData: tagType,
        });
    }

    async updateTagType(
        updatedTagType: ITagType,
        userName: string,
        userId: number,
    ): Promise<ITagType> {
        const data = await tagTypeSchema.validateAsync(updatedTagType);
        await this.tagTypeStore.updateTagType(data);
        await this.eventService.storeEvent({
            type: TAG_TYPE_UPDATED,
            createdBy: userName || SYSTEM_USER.username,
            createdByUserId: userId,
            data,
        });
        return data;
    }
}

module.exports = TagTypeService;
