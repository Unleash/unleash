import type { SWRConfiguration } from 'swr';
import useUnleashContext from './useUnleashContext';

/**
 * Returns all context fields defined in Unleash, both on the root level and
 * within all projects.
 *
 * @returns All context fields in Unleash.
 */
export const useFullUnleashContext = (options?: SWRConfiguration) => {
    return useUnleashContext({ mode: 'all' }, options);
};
