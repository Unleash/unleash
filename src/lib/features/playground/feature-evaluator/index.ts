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
export { type Context, type Variant, FeatureEvaluator, InMemStorageProvider };
export type { ClientFeaturesResponse, FeatureEvaluatorConfig };
