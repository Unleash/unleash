import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags.js';

/**
 * Explicit stability declaration for each operation.
 * - release.beta+stable: alpha before beta, beta before stable, stable after.
 * - release.beta only: alpha before beta, beta after.
 * - release.stable only: alpha before stable, stable after.
 * - release.alpha: explicitly opt out of cutoffs (remains alpha).
 * Note: legacy endpoints that omit release are temporarily tolerated in validPath,
 * which defers to calculateStability (stable until version 7.7.7, then alpha) until backfill is complete.
 */
export type StabilityRelease =
    | { alpha: true }
    | { beta: StrictXyzVersion }
    | { beta: StrictXyzVersion; stable: StrictXyzVersion }
    | { stable: StrictXyzVersion };

type DeprecatedOpenAPITag =
    // Deprecated tag names. Please use a tag from the OpenAPITag type instead.
    //
    // These tag names were the original ones we used for OpenAPI, but they
    // turned out to be too generic and/or didn't match the new tag naming
    // schema. Because we require our operations to have one of a predefined set
    // of values, it would be breaking change to remove them completely.
    'client' | 'other' | 'auth' | 'admin';

export type StrictXyzVersion =
    | `${bigint}`
    | `${bigint}.${bigint}`
    | `${bigint}.${bigint}.${bigint}`;

export type ApiOperation<Tag = OpenApiTag | DeprecatedOpenAPITag> = Omit<
    OpenAPIV3.OperationObject,
    'tags'
> & {
    operationId: string;
    tags: [Tag];
    enterpriseOnly?: boolean;
    release: StabilityRelease;
};
