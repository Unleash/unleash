import type { Store } from '../../types/stores/store';

export interface IFeatureLink {
    id: string;
    featureName: string;
    url: string;
    title?: string;
}

export interface IFeatureLinkStore extends Store<IFeatureLink, string> {
    insert(link: Omit<IFeatureLink, 'id'>): Promise<IFeatureLink>;
    update(id: string, link: Omit<IFeatureLink, 'id'>): Promise<IFeatureLink>;
}
