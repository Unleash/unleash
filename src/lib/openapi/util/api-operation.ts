import type { OpenAPIV3 } from 'openapi-types';
import type { OpenApiTag } from './openapi-tags.js';
import semver from 'semver';

/**
 * Calculate stability level based on comparing release and current versions.
 * - Alpha: release version is ahead of current (not yet released)
 * - Beta: current is 0-2 minor versions ahead of release version
 * - Stable: current is more than 2 minor versions ahead of release version
 */
export function calculateStability(
    releaseVersion: string,
    currentVersion: string,
): 'alpha' | 'beta' | 'stable' {
    const release = semver.coerce(releaseVersion);
    const current = semver.coerce(currentVersion);

    if (!release || !current) {
        return 'stable'; // Default to stable if versions can't be parsed
    }

    // If release is ahead of current, it's alpha (not yet released)
    if (semver.gt(release, current)) {
        return 'alpha';
    }

    // Calculate minor version difference
    // For same major: just subtract minors
    // For different major: consider major difference as many minors
    const majorDiff = current.major - release.major;
    const minorDiff = current.minor - release.minor;
    const totalMinorDiff = majorDiff * 1000 + minorDiff; // Major version jump = 1000 minors (effectively always stable)

    if (totalMinorDiff <= 2) {
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
    /** @deprecated use releaseVersion instead */
    beta?: boolean;
    /**
     * The version when this API was introduced or last significantly changed.
     * Used to automatically calculate stability:
     * - Alpha: release version is ahead of current version (not yet released)
     * - Beta: current version is 0-2 minor versions ahead of release version
     * - Stable: current version is 3 or more minor versions ahead of release version
     *
     * When developing a new API, set this to your best estimate of when it will be released.
     * All APIs naturally progress through the beta -> stable lifecycle as versions advance.
     * @default '7.0.0'
     */
    releaseVersion?: string;
    enterpriseOnly?: boolean;
}
