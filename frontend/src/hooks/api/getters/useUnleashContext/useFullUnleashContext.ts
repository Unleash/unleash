import type { SWRConfiguration } from 'swr';
import useUnleashContext from './useUnleashContext';

export const useFullUnleashContext = (options?: SWRConfiguration) => {
    return useUnleashContext({ mode: 'all' }, options);
};
