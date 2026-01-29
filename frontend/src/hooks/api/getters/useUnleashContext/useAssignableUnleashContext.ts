import type { SWRConfiguration } from 'swr';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.js';
import useUnleashContext from './useUnleashContext';

/**
 * Returns the set of context fields that can be added to a constraint in the
 * current context. Uses the project id to determine whether to return only
 * root-level context fields or root-level fields and fields belonging to the
 * project.
 *
 * If the project ID is not provided, it will attempt to grab it from the URL.
 *
 * @param projectId {string} Specify which project to include context fields for. If falsy, the hook will check the URL.
 * @returns The set of context fields that can be added to a constraint in the current context.
 */
export const useAssignableUnleashContext = (
    projectId?: string,
    options?: SWRConfiguration,
) => {
    const pathProjectId = useOptionalPathParam('projectId');
    const normalizedProjectId = projectId || pathProjectId;
    const mode = normalizedProjectId
        ? {
              mode: 'assignable-in-project' as const,
              projectId: normalizedProjectId,
          }
        : { mode: 'root-only' as const };
    return useUnleashContext(mode, options);
};
