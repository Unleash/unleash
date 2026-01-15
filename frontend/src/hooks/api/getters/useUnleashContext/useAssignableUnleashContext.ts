import type { SWRConfiguration } from 'swr';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.js';
import useUnleashContext from './useUnleashContext';

export const useAssignableUnleashContext = (
    projectId?: string,
    options?: SWRConfiguration,
) => {
    const pathProjectId = useOptionalPathParam('projectId');
    const normalizedProjectId = projectId || pathProjectId;
    const mode = normalizedProjectId
        ? {
              mode: 'assignable in project' as const,
              projectId: normalizedProjectId,
          }
        : { mode: 'root only' as const };
    return useUnleashContext(mode, options);
};
