import type { Store } from '../../types/stores/store.js';

export interface IFeatureLink {
    id: string;
    featureName: string;
    url: string;
    title?: string;
    domain: string | null;
}

export interface IFeatureLinkStore extends Store<IFeatureLink, string> {
    insert(link: Omit<IFeatureLink, 'id'>): Promise<IFeatureLink>;
    update(id: string, link: Omit<IFeatureLink, 'id'>): Promise<IFeatureLink>;
    count(query?: Partial<Omit<IFeatureLink, 'id'>>): Promise<number>;
}
