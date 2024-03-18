import type { IFeatureToggleClient } from '../../types';

export interface IClientFeatureToggleReadModel {
    getAll(): Promise<Record<string, Record<string, IFeatureToggleClient>>>;
}
