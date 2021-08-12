import { Store } from './store';

export interface IFeatureType {
    id: number;
    name: string;
    description: string;
    lifetimeDays: number;
}

export interface IFeatureTypeStore extends Store<IFeatureType, number> {
    getByName(name: string): Promise<IFeatureType>;
}
