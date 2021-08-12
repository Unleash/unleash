import { ITag } from '../../lib/types/model';
import {
    IFeatureAndTag,
    IFeatureTag,
    IFeatureTagStore,
} from '../../lib/types/stores/feature-tag-store';

export default class FakeFeatureTagStore implements IFeatureTagStore {
    private featureTags: IFeatureTag[] = [];

    async getAllTagsForFeature(featureName: string): Promise<ITag[]> {
        const tags = this.featureTags
            .filter((f) => f.featureName === featureName)
            .map((f) => ({
                type: f.tagType,
                value: f.tagValue,
            }));
        return Promise.resolve(tags);
    }

    async delete(key: IFeatureTag): Promise<void> {
        this.featureTags.splice(
            this.featureTags.findIndex((t) => t === key),
            1,
        );
    }

    destroy(): void {}

    async exists(key: IFeatureTag): Promise<boolean> {
        return this.featureTags.some((t) => t === key);
    }

    async get(key: IFeatureTag): Promise<IFeatureTag> {
        return this.featureTags.find((t) => t === key);
    }

    async getAll(): Promise<IFeatureTag[]> {
        return this.featureTags;
    }

    async tagFeature(featureName: string, tag: ITag): Promise<ITag> {
        this.featureTags.push({
            featureName,
            tagType: tag.type,
            tagValue: tag.value,
        });
        return Promise.resolve(tag);
    }

    async getAllFeatureTags(): Promise<IFeatureTag[]> {
        return Promise.resolve(this.featureTags);
    }

    async deleteAll(): Promise<void> {
        this.featureTags = [];
        return Promise.resolve();
    }

    async importFeatureTags(
        featureTags: IFeatureTag[],
    ): Promise<IFeatureAndTag[]> {
        return Promise.all(
            featureTags.map(async (fT) => {
                const saved = await this.tagFeature(fT.featureName, {
                    value: fT.tagValue,
                    type: fT.tagType,
                });
                return {
                    featureName: fT.featureName,
                    tag: saved,
                };
            }),
        );
    }

    async untagFeature(featureName: string, tag: ITag): Promise<void> {
        this.featureTags = this.featureTags.filter((fT) => {
            if (fT.featureName === featureName) {
                return !(fT.tagType === tag.type && fT.tagValue === tag.value);
            }
            return true;
        });
        return Promise.resolve();
    }
}

module.exports = FakeFeatureTagStore;
