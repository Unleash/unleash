import { ALL_PROJECTS } from '../../../util/index.js';
import type { EnvironmentVisibleRevisionState } from './client-feature-toggle-delta.js';
import type { ClientFeatureSchema } from '../../../openapi/index.js';

export const getReferencedSegmentIds = (
    features: ClientFeatureSchema[],
    projects: string[] = [ALL_PROJECTS],
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
    projects: string[] = [ALL_PROJECTS],
    referencedSegmentIds?: Set<number>,
): number => {
    if (!revisionState) {
        return 0;
    }

    const projectList =
        projects.length > 0 && !projects.includes(ALL_PROJECTS)
            ? projects
            : Array.from(revisionState.projectRevisions.keys());
    let visibleRevision = revisionState.maxReferencedSegmentRevision ?? 0;
    if (referencedSegmentIds) {
        visibleRevision = 0;
        for (const segmentId of referencedSegmentIds) {
            visibleRevision = Math.max(
                visibleRevision,
                revisionState.segmentRevisions.get(segmentId) ?? 0,
            );
        }
    }
    for (const project of projectList) {
        visibleRevision = Math.max(
            visibleRevision,
            revisionState.projectRevisions.get(project) ?? 0,
        );
    }

    return visibleRevision;
};
