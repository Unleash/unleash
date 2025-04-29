import {
    FeatureEvaluator,
    type FeatureEvaluatorConfig,
} from './feature-evaluator.js';
import { Variant } from './variant.js';
import { Context } from './context.js';
import type { ClientFeaturesResponse } from './feature.js';
import InMemStorageProvider from './repository/storage-provider-in-mem.js';

// exports
export { Strategy } from './strategy/index.js';
export { Context, Variant, FeatureEvaluator, InMemStorageProvider };
export type { ClientFeaturesResponse, FeatureEvaluatorConfig };
