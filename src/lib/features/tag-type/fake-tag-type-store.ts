import type { ITagType, ITagTypeStore } from './tag-type-store-type.js';

import { NotFoundError } from '../../error/index.js';

export default class FakeTagTypeStore implements ITagTypeStore {
    tagTypes: ITagType[] = [];

    async bulkImport(tagTypes: ITagType[]): Promise<ITagType[]> {
        tagTypes.forEach((tT) => {
            this.tagTypes.push(tT);
        });
        return tagTypes;
    }

    async createTagType(newTagType: ITagType): Promise<void> {
        this.tagTypes.push(newTagType);
    }

    async delete(key: string): Promise<void> {
        this.tagTypes.splice(
            this.tagTypes.findIndex((tt) => tt.name === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.tagTypes = [];
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.tagTypes.some((t) => t.name === key);
    }

    async get(key: string): Promise<ITagType> {
        const tagType = this.tagTypes.find((t) => t.name === key);
        if (tagType) {
            return tagType;
        }
        throw new NotFoundError('Could not find tag type');
    }

    async getAll(): Promise<ITagType[]> {
        return this.tagTypes;
    }

    async updateTagType(tagType: ITagType): Promise<void> {
        await this.delete(tagType.name);
        return this.createTagType(tagType);
    }
}
