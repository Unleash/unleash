import type { ITag } from '../../lib/tags/index.js';
import type {
    IFeatureAndTag,
    IFeatureTag,
    IFeatureTagStore,
} from '../../lib/types/stores/feature-tag-store.js';

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

    async getAllFeaturesForTag(tagValue: string): Promise<string[]> {
        const tags = this.featureTags
            .filter((f) => f.tagValue === tagValue)
            .map((f) => f.featureName);
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

    async get(key: IFeatureTag): Promise<IFeatureTag | undefined> {
        return this.featureTags.find((t) => t === key);
    }

    async getAll(): Promise<IFeatureTag[]> {
        return this.featureTags;
    }

    async tagFeature(
        featureName: string,
        tag: ITag,
        createdByUserId: number,
    ): Promise<ITag> {
        this.featureTags.push({
            featureName,
            tagType: tag.type,
            tagValue: tag.value,
            createdByUserId,
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

    async tagFeatures(featureTags: IFeatureTag[]): Promise<IFeatureAndTag[]> {
        return Promise.all(
            featureTags.map(async (fT) => {
                const saved = await this.tagFeature(
                    fT.featureName,
                    {
                        value: fT.tagValue,
                        type: fT.tagType,
                    },
                    fT.createdByUserId || -1337,
                );
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

    getAllByFeatures(features: string[]): Promise<IFeatureTag[]> {
        return Promise.resolve(
            this.featureTags.filter((tag) =>
                features.includes(tag.featureName),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    untagFeatures(featureTags: IFeatureTag[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
