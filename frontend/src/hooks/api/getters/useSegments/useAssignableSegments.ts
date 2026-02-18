import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { useSegments } from './useSegments';
import type { ISegment } from 'interfaces/segment';

/**
 * Returns the set of segments fields that can be added to a strategy in the
 * current context. Uses the project id to determine whether to return only
 * root-level segments or root-level segments and segments belonging to the
 * project.
 *
 * If the project ID is not provided, it will attempt to grab it from the URL.
 *
 * @param projectId {string} Specify which project to include segments for. If falsy, the hook will check the URL.
 * @returns The set of context fields that can be added to a constraint in the current context.
 */
export const useAssignableSegments = (
    projectId?: string,
): ReturnType<typeof useSegments> => {
    const pathProjectId = useOptionalPathParam('projectId');
    const normalizedProjectId = projectId || pathProjectId;

    const { segments, ...rest } = useSegments();

    const filter: (segment: ISegment) => boolean = normalizedProjectId
        ? ({ project }) => !project || project === normalizedProjectId
        : ({ project }) => !project;

    return { segments: segments?.filter(filter), ...rest };
};
