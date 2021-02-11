const NameExistsError = require('../error/name-exists-error');
const NotFoundError = require('../error/notfound-error');
const { tagTypeSchema } = require('./tag-type-schema');
const {
    TAG_TYPE_CREATED,
    TAG_TYPE_DELETED,
    TAG_TYPE_UPDATED,
} = require('../event-type');

class TagTypeService {
    constructor({ tagTypeStore, eventStore }, { getLogger }) {
        this.tagTypeStore = tagTypeStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/tag-type-service.js');
    }

    async getAll() {
        return this.tagTypeStore.getAll();
    }

    async getTagType(name) {
        return this.tagTypeStore.getTagType(name);
    }

    async createTagType(newTagType, userName) {
        const data = await tagTypeSchema.validateAsync(newTagType);
        await this.validateUnique(newTagType);
        await this.tagTypeStore.createTagType(data);
        await this.eventStore.store({
            type: TAG_TYPE_CREATED,
            createdBy: userName || 'unleash-system',
            data,
        });
        return data;
    }

    async validateUnique({ name }) {
        try {
            await this.tagTypeStore.getTagType(name);
        } catch (err) {
            if (err instanceof NotFoundError) {
                return;
            }
        }
        throw new NameExistsError(
            `There already exists a tag-type with the name ${name}`,
        );
    }

    async validate(tagType) {
        await tagTypeSchema.validateAsync(tagType);
        await this.validateUnique(tagType);
    }

    async deleteTagType(name, userName) {
        await this.tagTypeStore.deleteTagType(name);
        await this.eventStore.store({
            type: TAG_TYPE_DELETED,
            createdBy: userName || 'unleash-system',
            data: { name },
        });
    }

    async updateTagType(updatedTagType, userName) {
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
