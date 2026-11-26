import { useSyncExternalStore } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { basePath } from 'utils/formatPath';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage';

const key = `${basePath}:unleash-newNavigation`;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const isOptedIn = () => getLocalStorageItem<boolean>(key) === true;

export const setNewNavigationEnabled = (enabled: boolean) => {
    setLocalStorageItem(key, enabled);
    for (const listener of listeners) {
        listener();
    }
};

type NewNavigationState = 'unavailable' | 'classic' | 'new';

export const useNewNavigation = () => {
    const available = Boolean(useUiFlag('improvedSidebarNavigation'));
    const optedIn = useSyncExternalStore(subscribe, isOptedIn);

    const navigation: NewNavigationState = !available
        ? 'unavailable'
        : optedIn
          ? 'new'
          : 'classic';

    return {
        navigation,
        setEnabled: setNewNavigationEnabled,
    };
};
