import type { IFeatureLastSeenResults } from '../last-seen-read-model.js';

export interface ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults>;
}
