import { FeatureEvaluator, FeatureEvaluatorConfig } from './feature-evaluator';
import { Variant } from './variant';
import { Context } from './context';
import { ClientFeaturesResponse } from './feature';
import InMemStorageProvider from './repository/storage-provider-in-mem';

// exports
export { Strategy } from './strategy/index';
export { Context, Variant, FeatureEvaluator, InMemStorageProvider };
export type { ClientFeaturesResponse, FeatureEvaluatorConfig };
