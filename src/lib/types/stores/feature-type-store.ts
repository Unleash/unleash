import type { Store } from './store.js';

export interface IFeatureType {
    id: string;
    name: string;
    description: string;
    lifetimeDays: number | null;
}

export interface IFeatureTypeStore extends Store<IFeatureType, string> {
    getByName(name: string): Promise<IFeatureType>;
    updateLifetime(
        name: string,
        newLifetimeDays: number | null,
    ): Promise<IFeatureType | undefined>;
}
