const { tagSchema } = require('./tag-schema');
const NotFoundError = require('../error/notfound-error');
const NameExistsError = require('../error/name-exists-error');
const { TAG_CREATED, TAG_DELETED } = require('../event-type');

class TagService {
    constructor({ tagStore, eventStore }, { getLogger }) {
        this.tagStore = tagStore;
        this.eventStore = eventStore;
        this.logger = getLogger('services/tag-service.js');
    }

    async getTags() {
        return this.tagStore.getAll();
    }

    async getTagsByType(type) {
        return this.tagStore.getTagsByType(type);
    }

    async getTag({ type, value }) {
        return this.tagStore.getTag(type, value);
    }

    async validateUnique(tag) {
        try {
            await this.tagStore.getTag(tag.type, tag.value);
        } catch (err) {
            if (err instanceof NotFoundError) {
                return;
            }
        }
        throw new NameExistsError(`A tag of ${tag} already exists`);
    }

    async validate(tag) {
        const data = await tagSchema.validateAsync(tag);
        await this.validateUnique(tag);
        return data;
    }

    async createTag(tag, userName) {
        const data = await this.validate(tag);
        await this.tagStore.createTag(data);
        await this.eventStore.store({
            type: TAG_CREATED,
            createdBy: userName,
            data,
        });
    }

    async deleteTag(tag, userName) {
        await this.tagStore.deleteTag(tag);
        await this.eventStore.store({
            type: TAG_DELETED,
            createdBy: userName,
            data: tag,
        });
    }
}

module.exports = TagService;
