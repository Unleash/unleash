import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags.js';
import semver from 'semver';

/**
 * Calculate stability level based on comparing beta/stable milestones
 * against the current version.
 * - Alpha: current version is before beta and before stable
 * - Beta: current version is >= beta and < stable
 * - Stable: current version is >= stable
 */
type StabilityVersions = {
    betaReleaseVersion?: string;
    stableReleaseVersion: string;
    currentVersion: string;
};

export function calculateStability({
    betaReleaseVersion,
    stableReleaseVersion,
    currentVersion,
}: StabilityVersions): 'alpha' | 'beta' | 'stable' {
    const current = semver.coerce(currentVersion);
    const beta = betaReleaseVersion ? semver.coerce(betaReleaseVersion) : null;
    const stable = semver.coerce(stableReleaseVersion);

    if (!current || !stable) {
        return 'stable'; // Default to stable if versions can't be parsed
    }

    if (semver.gte(current, stable)) {
        return 'stable';
    }

    if (beta && semver.gte(current, beta)) {
        return 'beta';
    }

    return 'alpha';
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
     * The first version where this API is expected to be beta.
     * If omitted, the API stays alpha until it reaches stable.
     */
    betaReleaseVersion?: string;
    /**
     * The first version where this API is expected to be stable.
     * @default '7.0.0'
     */
    stableReleaseVersion?: string;
    enterpriseOnly?: boolean;
}
