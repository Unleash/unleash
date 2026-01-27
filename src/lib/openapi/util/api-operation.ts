import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags.js';
import semver from 'semver';

/**
 * Calculate stability level based on comparing alpha/beta cutoffs
 * against the current version.
 * - Alpha: current version is before alpha cutoff (when defined)
 * - Beta: current version is at/after alpha cutoff and before beta cutoff (when defined)
 * - Stable: current version is at/after beta cutoff (when defined), or when no cutoffs apply
 */
type StabilityVersions = {
    alphaUntilVersion?: string;
    betaUntilVersion?: string;
    currentVersion: string;
};

export function calculateStability({
    alphaUntilVersion,
    betaUntilVersion,
    currentVersion,
}: StabilityVersions): 'alpha' | 'beta' | 'stable' {
    if (!alphaUntilVersion && !betaUntilVersion) {
        return 'stable';
    }
    const current = semver.coerce(currentVersion);
    if (!current) {
        return 'stable'; // Default to stable if current can't be parsed
    }

    const alphaUntil = alphaUntilVersion
        ? semver.coerce(alphaUntilVersion)
        : null;
    const betaUntil = betaUntilVersion ? semver.coerce(betaUntilVersion) : null;

    if (alphaUntil && semver.lt(current, alphaUntil)) {
        return 'alpha';
    }

    if (betaUntil && semver.lt(current, betaUntil)) {
        return 'beta';
    }

    return 'stable';
}

type DeprecatedOpenAPITag =
    // Deprecated tag names. Please use a tag from the OpenAPITag type instead.
    //
    // These tag names were the original ones we used for OpenAPI, but they
    // turned out to be too generic and/or didn't match the new tag naming
    // schema. Because we require our operations to have one of a predefined set
    // of values, it would be breaking change to remove them completely.
    'client' | 'other' | 'auth' | 'admin';

export interface ApiOperation<Tag = OpenApiTag | DeprecatedOpenAPITag>
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
    /**
     * Intended audience for the endpoint. Used for OpenAPI extensions only.
     * @default 'internal'
     */
    audience?: 'core' | 'integration' | 'ui' | 'internal';
    /**
     * The version up to (but not including) which this API is alpha.
     * If omitted, the API is never alpha.
     */
    alphaUntilVersion?: string;
    /**
     * The version up to (but not including) which this API is beta.
     * If omitted, the API is stable once it is no longer alpha.
     */
    betaUntilVersion?: string;
    /**
     * The version when this API was introduced or last significantly changed.
     * Documentation only; does not affect stability calculation.
     */
    releaseVersion?: string;
    enterpriseOnly?: boolean;
}
