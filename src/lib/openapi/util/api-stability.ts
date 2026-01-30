import semver from 'semver';
import type { StabilityRelease, StrictXyzVersion } from './api-operation.js';

export function calculateStability(
    release: StabilityRelease | undefined,
    currentVersion: string,
): 'alpha' | 'beta' | 'stable' {
    const current = semver.coerce(currentVersion);
    if (!current) {
        return 'stable'; // Default to stable if current can't be parsed
    }

    if (release && 'alpha' in release) {
        return 'alpha';
    }

    const betaVersion =
        release && 'beta' in release ? semver.coerce(release.beta) : null;
    const stableVersion =
        release && 'stable' in release ? semver.coerce(release.stable) : null;
    if (!betaVersion && !stableVersion) {
        // existing endpoints are stable, but until we backfill them they won't have these fields and therefore will be alpha, but because we don't want that, we default to stable for a period of time until we backfill all existing endpoints
        if (semver.lt(current, '7.7.7')) {
            return 'stable';
        }
        return 'alpha';
    }

    // if both beta and stable are defined
    if (betaVersion && stableVersion && semver.lt(betaVersion, stableVersion)) {
        if (semver.lt(current, betaVersion)) {
            return 'alpha';
        }
        if (semver.lt(current, stableVersion)) {
            return 'beta';
        }
        return 'stable';
    }

    // if only beta is defined it moves from alpha to beta
    if (betaVersion && !stableVersion) {
        if (semver.lt(current, betaVersion)) {
            return 'alpha';
        } else {
            return 'beta';
        }
    }

    // if stable is defined it moves from alpha to stable (skipping beta because it's not defined or is after stable which is invalid)
    if (stableVersion) {
        if (semver.lt(current, stableVersion)) {
            return 'alpha';
        } else {
            return 'stable';
        }
    }

    return 'stable';
}
