import type { IFeatureToggleClient } from '../../types/index.js';

export interface IClientFeatureToggleReadModel {
    getAll(): Promise<Record<string, Record<string, IFeatureToggleClient>>>;
}
