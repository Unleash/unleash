import NotFoundError from '../error/notfound-error.js';
import {
    FEATURE_TAGGED,
    FEATURE_UNTAGGED,
    TAG_CREATED,
} from '../events/index.js';
import type {
    ITagStore,
    IFeatureToggleStore,
    IUnleashStores,
} from '../types/stores.js';
import { tagSchema } from './tag-schema.js';
import type {
    IFeatureTag,
    IFeatureTagInsert,
    IFeatureTagStore,
} from '../types/stores/feature-tag-store.js';
import {
    type IAuditUser,
    type IUnleashConfig,
    FeatureTaggedEvent,
} from '../types/index.js';
import { BadDataError, FOREIGN_KEY_VIOLATION } from '../../lib/error/index.js';
import type EventService from '../features/events/event-service.js';
import type { ITag } from '../tags/index.js';
import type { Logger } from '../logger.js';

class FeatureTagService {
    private tagStore: ITagStore;

    private featureTagStore: IFeatureTagStore;

    private featureToggleStore: IFeatureToggleStore;

    private eventService: EventService;

    private logger: Logger;

    constructor(
        {
            tagStore,
            featureTagStore,
            featureToggleStore,
        }: Pick<
            IUnleashStores,
            'tagStore' | 'featureTagStore' | 'featureToggleStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.logger = getLogger('/services/feature-tag-service.ts');
        this.tagStore = tagStore;
        this.featureTagStore = featureTagStore;
        this.featureToggleStore = featureToggleStore;
        this.eventService = eventService;
    }

    async listTags(featureName: string): Promise<ITag[]> {
        return this.featureTagStore.getAllTagsForFeature(featureName);
    }

    async listFeatures(tagValue: string): Promise<string[]> {
        return this.featureTagStore.getAllFeaturesForTag(tagValue);
    }

    // TODO: add project Id
    async addTag(
        featureName: string,
        tag: ITag,
        auditUser: IAuditUser,
    ): Promise<ITag> {
        this.logger.debug(`Adding tag ${tag} to {featureName}`);
        const featureToggle = await this.featureToggleStore.get(featureName);
        if (featureToggle === undefined) {
            throw new NotFoundError();
        }
        const validatedTag = await tagSchema.validateAsync(tag);
        await this.createTagIfNeeded(validatedTag, auditUser);
        await this.featureTagStore.tagFeature(
            featureName,
            validatedTag,
            auditUser.id,
        );

        await this.eventService.storeEvent(
            new FeatureTaggedEvent({
                featureName,
                project: featureToggle.project,
                data: validatedTag,
                auditUser,
            }),
        );
        return validatedTag;
    }

    async updateTags(
        featureNames: string[],
        addedTags: ITag[],
        removedTags: ITag[],
        auditUser: IAuditUser,
    ): Promise<void> {
        const featureToggles =
            await this.featureToggleStore.getAllByNames(featureNames);
        await Promise.all(
            addedTags.map((tag) => this.createTagIfNeeded(tag, auditUser)),
        );
        const createdFeatureTags: IFeatureTagInsert[] = featureNames.flatMap(
            (featureName) =>
                addedTags.map((addedTag) => ({
                    featureName,
                    tagType: addedTag.type,
                    tagValue: addedTag.value,
                    createdByUserId: auditUser.id,
                })),
        );

        await this.featureTagStore.tagFeatures(createdFeatureTags);

        const removedFeatureTags: Omit<IFeatureTag, 'createdByUserId'>[] =
            featureNames.flatMap((featureName) =>
                removedTags.map((addedTag) => ({
                    featureName,
                    tagType: addedTag.type,
                    tagValue: addedTag.value,
                })),
            );

        await this.featureTagStore.untagFeatures(removedFeatureTags);

        const creationEvents = featureToggles.flatMap((featureToggle) =>
            addedTags.map((addedTag) => ({
                type: FEATURE_TAGGED,
                createdBy: auditUser.username,
                featureName: featureToggle.name,
                project: featureToggle.project,
                data: addedTag,
                createdByUserId: auditUser.id,
                ip: auditUser.ip,
            })),
        );

        const removalEvents = featureToggles.flatMap((featureToggle) =>
            removedTags.map((removedTag) => ({
                type: FEATURE_UNTAGGED,
                featureName: featureToggle.name,
                project: featureToggle.project,
                preData: removedTag,
                createdBy: auditUser.username,
                createdByUserId: auditUser.id,
                ip: auditUser.ip,
            })),
        );

        await this.eventService.storeEvents([
            ...creationEvents,
            ...removalEvents,
        ]);
    }

    async createTagIfNeeded(tag: ITag, auditUser: IAuditUser): Promise<void> {
        try {
            await this.tagStore.getTag(tag.type, tag.value);
        } catch (error) {
            if (error instanceof NotFoundError) {
                try {
                    await this.tagStore.createTag(tag);
                    await this.eventService.storeEvent({
                        type: TAG_CREATED,
                        createdBy: auditUser.username,
                        createdByUserId: auditUser.id,
                        ip: auditUser.ip,
                        data: tag,
                    });
                } catch (err) {
                    if (err.code === FOREIGN_KEY_VIOLATION) {
                        throw new BadDataError(
                            `Tag type '${tag.type}' does not exist`,
                        );
                    }
                }
            }
        }
    }

    // TODO: add project Id
    async removeTag(
        featureName: string,
        tag: ITag,
        auditUser: IAuditUser,
    ): Promise<void> {
        const featureToggle = await this.featureToggleStore.get(featureName);
        if (featureToggle === undefined) {
            /// No toggle, so no point in removing tags
            return;
        }
        const tags =
            await this.featureTagStore.getAllTagsForFeature(featureName);
        await this.featureTagStore.untagFeature(featureName, tag);
        await this.eventService.storeEvent({
            type: FEATURE_UNTAGGED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            featureName,
            project: featureToggle.project,
            preData: tag,
            tags,
        });
    }
}

export default FeatureTagService;
