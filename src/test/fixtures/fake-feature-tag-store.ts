import FeatureTagStore, {
    IFeatureAndTag,
    IFeatureTag,
} from '../../lib/db/feature-tag-store';
import noLoggerProvider from './no-logger';
import { ITag } from '../../lib/types/model';

export default class FakeFeatureTagStore extends FeatureTagStore {
    private featureTags: IFeatureTag[] = [];

    constructor() {
        super(undefined, undefined, noLoggerProvider);
    }

    async getAllTagsForFeature(featureName: string): Promise<ITag[]> {
        const tags = this.featureTags
            .filter(f => f.featureName === featureName)
            .map(f => ({
                type: f.tagType,
                value: f.tagValue,
            }));
        return Promise.resolve(tags);
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

    async dropFeatureTags(): Promise<void> {
        this.featureTags = [];
        return Promise.resolve();
    }

    async importFeatureTags(
        featureTags: IFeatureTag[],
    ): Promise<IFeatureAndTag[]> {
        return Promise.all(
            featureTags.map(async fT => {
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
        this.featureTags = this.featureTags.filter(fT => {
            if (fT.featureName === featureName) {
                return !(fT.tagType === tag.type && fT.tagValue === tag.value);
            }
            return true;
        });
        return Promise.resolve();
    }
}

module.exports = FakeFeatureTagStore;
