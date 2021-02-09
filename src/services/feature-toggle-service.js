const { FEATURE_TAGGED, FEATURE_UNTAGGED } = require('../event-type');
const { featureSchema, nameSchema, querySchema } = require('./feature-schema');
const { tagSchema } = require('./tag-schema');
const NameExistsError = require('../error/name-exists-error');
const NotFoundError = require('../error/notfound-error');
const {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
    FEATURE_UPDATED,
    TAG_CREATED,
} = require('../event-type');

class FeatureToggleService {
    constructor({ featureToggleStore, tagStore, eventStore }, { getLogger }) {
        this.featureToggleStore = featureToggleStore;
        this.tagStore = tagStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/feature-toggle-service.js');
    }

    async getFeatures(query, fields) {
        const preppedQuery = await this.prepQuery(query);
        return this.featureToggleStore.getFeatures(preppedQuery, fields);
    }

    paramToArray(param) {
        if (!param) {
            return param;
        }
        return Array.isArray(param) ? param : [param];
    }

    async prepQuery({ tag, project, namePrefix }) {
        if (!tag && !project && !namePrefix) {
            return null;
        }
        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
        });
        if (query.tag) {
            query.tag = query.tag.map(q => q.split(':'));
        }
        return query;
    }

    async getArchivedFeatures() {
        return this.featureToggleStore.getArchivedFeatures();
    }

    async addArchivedFeature(feature) {
        await this.featureToggleStore.addArchivedFeature(feature);
    }

    async getFeature(name) {
        return this.featureToggleStore.getFeature(name);
    }

    async createFeatureToggle(value, userName) {
        await this.validateName(value);
        const feature = await featureSchema.validateAsync(value);
        await this.featureToggleStore.createFeature(feature);
        await this.eventStore.store({
            type: FEATURE_CREATED,
            createdBy: userName,
            data: feature,
        });
    }

    async updateToggle(updatedFeature, userName) {
        await this.featureToggleStore.getFeature(updatedFeature.name);
        const value = await featureSchema.validateAsync(updatedFeature);
        await this.featureToggleStore.updateFeature(value);
        const tags =
            (await this.featureToggleStore.getAllTagsForFeature(
                updatedFeature.name,
            )) || [];
        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy: userName,
            data: updatedFeature,
            tags,
        });
    }

    async archiveToggle(name, userName) {
        await this.featureToggleStore.getFeature(name);
        await this.featureToggleStore.archiveFeature(name);
        const tags =
            (await this.featureToggleStore.getAllTagsForFeature(name)) || [];
        await this.eventStore.store({
            type: FEATURE_ARCHIVED,
            createdBy: userName,
            data: { name },
            tags,
        });
    }

    async reviveToggle(name, userName) {
        await this.featureToggleStore.reviveFeature({ name });
        const tags =
            (await this.featureToggleStore.getAllTagsForFeature(name)) || [];

        await this.eventStore.store({
            type: FEATURE_REVIVED,
            createdBy: userName,
            data: { name },
            tags,
        });
    }

    async toggle(featureName, userName) {
        const feature = await this.featureToggleStore.getFeature(featureName);
        const toggle = !feature.enabled;
        return this.updateField(feature.name, 'enabled', toggle, userName);
    }

    /** Tag releated  */
    async listTags(featureName) {
        return this.featureToggleStore.getAllTagsForFeature(featureName);
    }

    async addTag(featureName, tag, userName) {
        await nameSchema.validateAsync({ name: featureName });
        const validatedTag = await tagSchema.validateAsync(tag);
        await this.createTagIfNeeded(validatedTag, userName);
        await this.featureToggleStore.tagFeature(featureName, validatedTag);
        await this.eventStore.store({
            type: FEATURE_TAGGED,
            createdBy: userName,
            data: {
                featureName,
                tag: validatedTag,
            },
        });
        return validatedTag;
    }

    async createTagIfNeeded(tag, userName) {
        try {
            await this.tagStore.getTag(tag.type, tag.value);
        } catch (error) {
            if (error instanceof NotFoundError) {
                await this.tagStore.createTag(tag);
                await this.eventStore.store({
                    type: TAG_CREATED,
                    createdBy: userName,
                    data: {
                        tag,
                    },
                });
            }
        }
    }

    async removeTag(featureName, tag, userName) {
        await this.featureToggleStore.untagFeature(featureName, tag);
        await this.eventStore.store({
            type: FEATURE_UNTAGGED,
            createdBy: userName,
            data: {
                featureName,
                tag,
            },
        });
    }

    /** Validations  */
    async validateName({ name }) {
        await nameSchema.validateAsync({ name });
        await this.validateUniqueFeatureName(name);
        return name;
    }

    async validateUniqueFeatureName(name) {
        let msg;
        try {
            const feature = await this.featureToggleStore.hasFeature(name);
            msg = feature.archived
                ? 'An archived toggle with that name already exists'
                : 'A toggle with that name already exists';
        } catch (error) {
            return;
        }
        throw new NameExistsError(msg);
    }

    async updateField(featureName, field, value, userName) {
        const feature = await this.featureToggleStore.getFeature(featureName);
        feature[field] = value;
        await this.featureToggleStore.updateFeature(feature);
        const tags =
            (await this.featureToggleStore.getAllTagsForFeature(featureName)) ||
            [];

        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy: userName,
            data: feature,
            tags,
        });
        return feature;
    }
}

module.exports = FeatureToggleService;
