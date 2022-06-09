import { Store } from './store';

export interface IFeatureType {
    id: string;
    name: string;
    description: string;
    lifetimeDays: number | null;
}

export interface IFeatureTypeStore extends Store<IFeatureType, string> {
    getByName(name: string): Promise<IFeatureType>;
}
