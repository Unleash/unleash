import { ITag } from '../model';
import { Store } from './store';

export interface IFeatureTag {
    featureName: string;
    tagType: string;
    tagValue: string;
}

export interface IFeatureAndTag {
    featureName: string;
    tag: ITag;
}
export interface IFeatureTagStore extends Store<IFeatureTag, IFeatureTag> {
    getAllTagsForFeature(featureName: string): Promise<ITag[]>;
    getAllByFeatures(features: string[]): Promise<IFeatureTag[]>;
    tagFeature(featureName: string, tag: ITag): Promise<ITag>;
    tagFeatures(featureNames: string[], tag: ITag): Promise<ITag>;
    importFeatureTags(featureTags: IFeatureTag[]): Promise<IFeatureAndTag[]>;
    untagFeature(featureName: string, tag: ITag): Promise<void>;
}
