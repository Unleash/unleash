import { createLocalStorage } from 'utils/createLocalStorage';
import { useGlobalLocalStorage } from './useGlobalLocalStorage';
import { useState } from 'react';

interface IGlobalStore {
    favorites?: boolean;
    hiddenEnvironments?: Set<string>;
}

export const useHiddenEnvironments = () => {
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
            } else {
                hiddenEnvironments.add(environment);
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
