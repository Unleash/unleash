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
    referencedSegmentIds?: Set<number>,
): number => {
    if (!revisionState) {
        return 0;
    }

    const projectList =
        projects.length > 0 && !projects.includes(ALL_PROJECTS)
            ? projects
            : Array.from(revisionState.projectRevisions.keys());
    let visibleRevision = revisionState.maxSegmentRevision ?? 0;
    if (referencedSegmentIds) {
        visibleRevision = Math.max(
            0,
            ...Array.from(referencedSegmentIds, (segmentId) => {
                return revisionState.segmentRevisions?.get(segmentId) ?? 0;
            }),
        );
    }
    for (const project of projectList) {
        visibleRevision = Math.max(
            visibleRevision,
            revisionState.projectRevisions.get(project) ?? 0,
        );
    }

    return visibleRevision;
};
