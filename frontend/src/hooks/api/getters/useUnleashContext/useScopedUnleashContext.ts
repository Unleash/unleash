import type { SWRConfiguration } from 'swr';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.js';
import useUnleashContext from './useUnleashContext';

export const useScopedUnleashContext = (options?: SWRConfiguration) => {
    const projectId = useOptionalPathParam('projectId');
    const mode = projectId
        ? { mode: 'project only' as const, projectId }
        : { mode: 'root only' as const };
    return useUnleashContext(mode, options);
};
