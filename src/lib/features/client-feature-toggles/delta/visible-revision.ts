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
    projects: string[] = ['*'],
): number => {
    if (!revisionState) {
        return 0;
    }

    const projectList =
        projects.length > 0 && !projects.includes(ALL_PROJECTS)
            ? projects
            : Array.from(revisionState.projectRevisions.keys());
    // assume segment revision as max because segment changes are always visible
    let visibleRevision = revisionState.maxCachedSegmentRevisionChange ?? 0;
    for (const project of projectList) {
        visibleRevision = Math.max(
            visibleRevision,
            revisionState.projectRevisions.get(project) ?? 0,
        );
    }

    return visibleRevision;
};
