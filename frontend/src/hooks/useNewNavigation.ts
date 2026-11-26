import { useSyncExternalStore } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { basePath } from 'utils/formatPath';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage';

const optInKey = `${basePath}:unleash-newNavigation`;
const popupDismissedKey = `${basePath}:unleash-newNavigationPopupDismissed`;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const notify = () => {
    for (const listener of listeners) {
        listener();
    }
};

const isOptedIn = () => getLocalStorageItem<boolean>(optInKey) === true;

const isPopupDismissed = () =>
    getLocalStorageItem<boolean>(popupDismissedKey) === true;

export const setNewNavigationEnabled = (enabled: boolean) => {
    setLocalStorageItem(optInKey, enabled);
    if (enabled) {
        setLocalStorageItem(popupDismissedKey, true);
    }
    notify();
};

const dismissPopup = () => {
    setLocalStorageItem(popupDismissedKey, true);
    notify();
};

type NewNavigationState = 'unavailable' | 'classic' | 'new';

export const useNewNavigation = () => {
    const available = Boolean(useUiFlag('improvedSidebarNavigation'));
    const optedIn = useSyncExternalStore(subscribe, isOptedIn);
    const popupDismissed = useSyncExternalStore(subscribe, isPopupDismissed);

    const navigation: NewNavigationState = !available
        ? 'unavailable'
        : optedIn
          ? 'new'
          : 'classic';

    return {
        navigation,
        setEnabled: setNewNavigationEnabled,
        showPopup: navigation === 'classic' && !popupDismissed,
        dismissPopup,
    };
};
