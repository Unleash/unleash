import NotFoundError from '../error/notfound-error';
import { Logger } from '../logger';
import { nameSchema } from '../schema/feature-schema';
import { FEATURE_TAGGED, FEATURE_UNTAGGED, TAG_CREATED } from '../types/events';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { tagSchema } from './tag-schema';
import { IFeatureTagStore } from '../types/stores/feature-tag-store';
import { IEventStore } from '../types/stores/event-store';
import { ITagStore } from '../types/stores/tag-store';
import { ITag } from '../types/model';

class FeatureTagService {
    private tagStore: ITagStore;

    private featureTagStore: IFeatureTagStore;

    private eventStore: IEventStore;

    private logger: Logger;

    constructor(
        {
            tagStore,
            featureTagStore,
            eventStore,
        }: Pick<IUnleashStores, 'tagStore' | 'featureTagStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('/services/feature-tag-service.ts');
        this.tagStore = tagStore;
        this.featureTagStore = featureTagStore;
        this.eventStore = eventStore;
    }

    async listTags(featureName: string): Promise<ITag[]> {
        return this.featureTagStore.getAllTagsForFeature(featureName);
    }

    // TODO: add project Id
    async addTag(
        featureName: string,
        tag: ITag,
        userName: string,
    ): Promise<ITag> {
        await nameSchema.validateAsync({ name: featureName });
        const validatedTag = await tagSchema.validateAsync(tag);
        await this.createTagIfNeeded(validatedTag, userName);
        await this.featureTagStore.tagFeature(featureName, validatedTag);

        await this.eventStore.store({
            type: FEATURE_TAGGED,
            createdBy: userName,
            featureName,
            data: validatedTag,
        });
        return validatedTag;
    }

    async createTagIfNeeded(tag: ITag, userName: string): Promise<void> {
        try {
            await this.tagStore.getTag(tag.type, tag.value);
        } catch (error) {
            if (error instanceof NotFoundError) {
                await this.tagStore.createTag(tag);
                await this.eventStore.store({
                    type: TAG_CREATED,
                    createdBy: userName,
                    data: tag,
                });
            }
        }
    }

    // TODO: add project Id
    async removeTag(
        featureName: string,
        tag: ITag,
        userName: string,
    ): Promise<void> {
        await this.featureTagStore.untagFeature(featureName, tag);
        await this.eventStore.store({
            type: FEATURE_UNTAGGED,
            createdBy: userName,
            featureName,
            data: tag,
        });
    }
}

export default FeatureTagService;
