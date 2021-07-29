import { ITagStore } from '../../lib/types/stores/tag-store';
import { ITag } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeTagStore implements ITagStore {
    tags: ITag[] = [];

    async bulkImport(tags: ITag[]): Promise<ITag[]> {
        tags.forEach((t) => this.tags.push(t));
        return tags;
    }

    async createTag(tag: ITag): Promise<void> {
        this.tags.push(tag);
    }

    async delete(key: ITag): Promise<void> {
        this.tags.splice(this.tags.findIndex((t) => t === key));
    }

    async deleteAll(): Promise<void> {
        this.tags = [];
    }

    destroy(): void {}

    async exists(key: ITag): Promise<boolean> {
        return this.tags.some((t) => t === key);
    }

    async get(key: ITag): Promise<ITag> {
        const tag = this.tags.find((t) => t === key);
        if (tag) {
            return tag;
        }
        throw new NotFoundError('Tag does not exist');
    }

    async getAll(): Promise<ITag[]> {
        return this.tags;
    }

    async getTag(type: string, value: string): Promise<ITag> {
        const tag = this.tags.find((t) => t.type === type && t.value === value);
        if (tag) {
            return tag;
        }
        throw new NotFoundError('Tag does not exist');
    }

    async getTagsByType(type: string): Promise<ITag[]> {
        return this.tags.filter((t) => t.type === type);
    }
}
