import { IFeatureToggleClient } from '../types';

export interface IClientFeatureToggleReadModel {
    getClient(): Promise<Record<string, IFeatureToggleClient[]>>;
}
