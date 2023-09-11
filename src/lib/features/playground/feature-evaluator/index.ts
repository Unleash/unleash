import { FeatureEvaluator, FeatureEvaluatorConfig } from './feature-evaluator';
import { Variant } from './variant';
import { Context } from './context';
import { ClientFeaturesResponse } from './feature';
import InMemStorageProvider from './repository/storage-provider-in-mem';

// exports
export type { Strategy } from './strategy';
export { FeatureEvaluator, InMemStorageProvider };
export type {
    Variant,
    Context,
    ClientFeaturesResponse,
    FeatureEvaluatorConfig,
};
