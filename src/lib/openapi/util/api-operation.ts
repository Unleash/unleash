import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags.js';

/**
 * Explicit stability declaration for each operation.
 * - release.beta+stable: alpha before beta, beta before stable, stable after.
 * - release.beta only: alpha before beta, beta after (stable is unknown, until someone defines it).
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

export type StrictXyzVersion =
    | `${bigint}`
    | `${bigint}.${bigint}`
    | `${bigint}.${bigint}.${bigint}`;

export type ApiOperation<Tag = OpenApiTag> = Omit<
    OpenAPIV3.OperationObject,
    'tags'
> & {
    operationId: string;
    tags: [Tag];
    enterpriseOnly?: boolean;
    release: StabilityRelease;
    /**
     * Intended audience for the endpoint. Used for OpenAPI extensions only.
     * @default 'public'
     */
    audience?: 'public' | 'integration' | 'sdk' | 'unleash-ui' | 'internal';
};
