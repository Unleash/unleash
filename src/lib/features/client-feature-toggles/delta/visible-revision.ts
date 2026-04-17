import { ALL_PROJECTS } from '../../../util/index.js';
import type { EnvironmentVisibleRevisionState } from './client-feature-toggle-delta.js';
import type { ClientFeatureSchema } from '../../../openapi/index.js';

export const getReferencedSegmentIds = (
    features: ClientFeatureSchema[],
    projects: string[] = ['*'],
    namePrefix: string = '',
): Set<number> => {
    const allProjects =
        projects.length === 0 || projects.includes(ALL_PROJECTS);
    const referencedSegmentIds = new Set<number>();

    for (const feature of features) {
        if (!feature.name.startsWith(namePrefix)) {
            continue;
        }

        if (!allProjects && !projects.includes(feature.project ?? '')) {
            continue;
        }

        for (const strategy of feature.strategies ?? []) {
            for (const segmentId of strategy.segments ?? []) {
                referencedSegmentIds.add(segmentId);
            }
        }
    }

    return referencedSegmentIds;
};

export const getVisibleRevision = (
    revisionState: EnvironmentVisibleRevisionState | undefined,
    features: ClientFeatureSchema[] = [],
): number => {
    if (!revisionState) {
        return 0;
    }
    let visibleRevision = 0;
    for (const revision of revisionState.projectRevisions.values()) {
        visibleRevision = Math.max(visibleRevision, revision);
    }

    const referencedSegmentIds = getReferencedSegmentIds(features);
    for (const segmentId of referencedSegmentIds) {
        visibleRevision = Math.max(
            visibleRevision,
            revisionState.segmentRevisions.get(segmentId) ?? 0,
        );
    }

    return visibleRevision;
};
