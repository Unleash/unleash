import type { IFeatureLastSeenResults } from '../last-seen-read-model';

export interface ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults>;
}
