import { auditEventFields } from '../util/index.js';
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

const byCodeUnits = (a: string, b: string): number =>
    a < b ? -1 : a > b ? 1 : 0;

// writing tags in this order makes concurrent writes of the same tags lock them in the same order
const sortedTags = (tags: ITag[]): ITag[] =>
    tags.toSorted(
        (a, b) => byCodeUnits(a.value, b.value) || byCodeUnits(a.type, b.type),
    );

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

    async updateFeatureTags(
        featureName: string,
        addedTags: ITag[],
        removedTags: ITag[],
        auditUser: IAuditUser,
    ): Promise<void> {
        // one at a time: the transaction runs on a single connection
        for (const addedTag of sortedTags(addedTags)) {
            await this.addTag(featureName, addedTag, auditUser);
        }

        for (const removedTag of sortedTags(removedTags)) {
            await this.removeTag(featureName, removedTag, auditUser);
        }
    }

    async updateTags(
        projectId: string,
        featureNames: string[],
        addedTags: ITag[],
        removedTags: ITag[],
        auditUser: IAuditUser,
    ): Promise<void> {
        const featureToggles =
            await this.featureToggleStore.getAllByNames(featureNames);
        const featureTogglesBelongToProject = featureToggles.every(
            (toggle) => toggle.project === projectId,
        );
        if (!featureTogglesBelongToProject) {
            throw new BadDataError(
                'Tried to change tags of feature not belonging to project',
            );
        }
        const sortedAddedTags = sortedTags(addedTags);
        // one at a time: the transaction runs on a single connection
        for (const tag of sortedAddedTags) {
            await this.createTagIfNeeded(tag, auditUser);
        }
        const createdFeatureTags: IFeatureTagInsert[] = featureNames.flatMap(
            (featureName) =>
                sortedAddedTags.map((addedTag) => ({
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
                featureName: featureToggle.name,
                project: featureToggle.project,
                ...auditEventFields(auditUser),
                data: addedTag,
            })),
        );

        const removalEvents = featureToggles.flatMap((featureToggle) =>
            removedTags.map((removedTag) => ({
                type: FEATURE_UNTAGGED,
                featureName: featureToggle.name,
                project: featureToggle.project,
                ...auditEventFields(auditUser),
                preData: removedTag,
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
                    // skips an existing tag: a unique violation would abort the transaction
                    const [createdTag] = await this.tagStore.bulkImport([tag]);
                    if (createdTag) {
                        await this.eventService.storeEvent({
                            type: TAG_CREATED,
                            ...auditEventFields(auditUser),
                            data: tag,
                        });
                    }
                } catch (err) {
                    if (err.code === FOREIGN_KEY_VIOLATION) {
                        throw new BadDataError(
                            `Tag type '${tag.type}' does not exist`,
                        );
                    }
                    throw err;
                }
            } else {
                throw error;
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
            ...auditEventFields(auditUser),
            featureName,
            project: featureToggle.project,
            preData: tag,
            tags,
        });
    }
}

export default FeatureTagService;
