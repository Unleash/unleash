import {
    FeatureEvaluator,
    type FeatureEvaluatorConfig,
} from './feature-evaluator.js';
import type { Variant } from './variant.js';
import type { Context } from './context.js';
import type { ClientFeaturesResponse } from './feature.js';
import InMemStorageProvider from './repository/storage-provider-in-mem.js';

// exports
export { Strategy } from './strategy/index.js';
export { FeatureEvaluator, InMemStorageProvider };
export type { Context, Variant };
export type { ClientFeaturesResponse, FeatureEvaluatorConfig };
