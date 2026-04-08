import type { EnvironmentVisibleRevisionState } from './client-feature-toggle-delta.js';

export const getVisibleRevision = (
    revisionState: EnvironmentVisibleRevisionState | undefined,
    projects: string[] = ['*'],
): number => {
    if (!revisionState) {
        return 0;
    }

    const projectList =
        projects.length > 0 && !projects.includes('*')
            ? projects
            : Array.from(revisionState.projectRevisions.keys());
    // assume segment revision as max because segment changes are always visible
    let visibleRevision = revisionState.globalSegmentRevision ?? 0;
    for (const project of projectList) {
        visibleRevision = Math.max(
            visibleRevision,
            revisionState.projectRevisions.get(project) ?? 0,
        );
    }

    return visibleRevision;
};
