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
                trackEvent('hidden_environment', {
                    props: {
                        eventType: `environment unhidden`,
                    },
                });
            } else {
                hiddenEnvironments.add(environment);
                trackEvent('hidden_environment', {
                    props: {
                        eventType: `environment hidden`,
                    },
                });
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
};
