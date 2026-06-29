import type {
    ReleasePlanSafeguardSchema,
    FeatureEnvironmentSafeguardSchema,
} from '../openapi/index.js';

export type ISafeguard =
    | ReleasePlanSafeguardSchema
    | FeatureEnvironmentSafeguardSchema;
