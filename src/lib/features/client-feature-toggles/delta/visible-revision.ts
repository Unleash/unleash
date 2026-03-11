export type VisibleRevisionState = {
    projectRevisions: Map<string, number>;
    globalSegmentRevision: number;
};

export const getVisibleRevisionForProjects = (
    revisionState: VisibleRevisionState | undefined,
    projects: string[],
    allProjectsRevisionId: number,
): number => {
    const projectList = projects.length > 0 ? projects : ['*'];

    if (projectList.includes('*')) {
        return allProjectsRevisionId;
    }

    if (!revisionState) {
        return 0;
    }

    let visibleRevision = revisionState.globalSegmentRevision;
    for (const project of projectList) {
        visibleRevision = Math.max(
            visibleRevision,
            revisionState.projectRevisions.get(project) ?? 0,
        );
    }

    return visibleRevision;
};
