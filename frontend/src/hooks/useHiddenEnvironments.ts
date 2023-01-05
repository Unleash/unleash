import { useGlobalLocalStorage } from './useGlobalLocalStorage';
import { useState } from 'react';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

export const useHiddenEnvironments = () => {
    const { trackEvent } = usePlausibleTracker();
    const { value: globalStore, setValue: setGlobalStore } =
        useGlobalLocalStorage();
    const [hiddenEnvironments, setStoredHiddenEnvironments] = useState<
        Set<string>
    >(new Set(globalStore.hiddenEnvironments));

    const setHiddenEnvironments = (environment: string) => {
        setGlobalStore(params => {
            const hiddenEnvironments = new Set(params.hiddenEnvironments);
            if (hiddenEnvironments.has(environment)) {
                hiddenEnvironments.delete(environment);
                trackHiddenEnvironment(false);
            } else {
                hiddenEnvironments.add(environment);
                trackHiddenEnvironment(true);
            }
            setStoredHiddenEnvironments(hiddenEnvironments);
            return {
                ...globalStore,
                hiddenEnvironments: hiddenEnvironments,
            };
        });
    };

    return {
        hiddenEnvironments,
        setHiddenEnvironments,
    };

    const trackHiddenEnvironment = (hide: boolean) => {
        trackEvent('hidden_environment', {
            props: {
                eventType: `environment ${!hide ? 'un' : ''}hidden`,
            },
        });
    };
};
