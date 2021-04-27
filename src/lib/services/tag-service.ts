import { tagSchema } from './tag-schema';
import TagStore, { ITag } from '../db/tag-store';
import EventStore from '../db/event-store';
import NameExistsError from '../error/name-exists-error';
import { TAG_CREATED, TAG_DELETED } from '../event-type';
import { Logger } from '../logger';

export default class TagService {
    private tagStore: TagStore;

    private eventStore: EventStore;

    private logger: Logger;

    constructor({ tagStore, eventStore }, { getLogger }) {
        this.tagStore = tagStore;
        this.eventStore = eventStore;
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
            throw new NameExistsError(`A tag of ${tag} already exists`);
        }
    }

    async validate(tag: ITag): Promise<ITag> {
        const data = (await tagSchema.validateAsync(tag)) as ITag;
        await this.validateUnique(tag);
        return data;
    }

    async createTag(tag: ITag, userName: string): Promise<void> {
        const data = await this.validate(tag);
        await this.tagStore.createTag(data);
        await this.eventStore.store({
            type: TAG_CREATED,
            createdBy: userName,
            data,
        });
    }

    async deleteTag(tag: ITag, userName: string): Promise<void> {
        await this.tagStore.deleteTag(tag);
        await this.eventStore.store({
            type: TAG_DELETED,
            createdBy: userName,
            data: tag,
        });
    }
}

module.exports = TagService;
