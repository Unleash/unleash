import type { SWRConfiguration } from 'swr';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.js';
import useUnleashContext from './useUnleashContext';

/**
 * Returns the set of context fields that "belong" to the current context, as
 * determined by the URL. If the URL contains a project ID, returns only context
 * fields belonging to that project. Otherwise, returns only root-level context
 * fields.
 *
 * @returns The set of context fields that belong to the current context.
 */
export const useScopedUnleashContext = (options?: SWRConfiguration) => {
    const projectId = useOptionalPathParam('projectId');
    const mode = projectId
        ? { mode: 'project-only' as const, projectId }
        : { mode: 'root-only' as const };
    return useUnleashContext(mode, options);
};
