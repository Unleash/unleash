import { useSyncExternalStore } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { basePath } from 'utils/formatPath';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage';

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

const storedFlag = (key: string) => ({
    read: () => getLocalStorageItem<boolean>(key) === true,
    set: (value: boolean) => {
        setLocalStorageItem(key, value);
        notify();
    },
});

type StoredFlag = ReturnType<typeof storedFlag>;

const useStoredFlag = (flag: StoredFlag) =>
    useSyncExternalStore(subscribe, flag.read);

const storedOptIn = storedFlag(`${basePath}:unleash-newNavigation`);
const storedOptInPopupDismissed = storedFlag(
    `${basePath}:unleash-newNavigationPopupDismissed`,
);
const storedSwitchBackPopupDismissed = storedFlag(
    `${basePath}:unleash-newNavigationSwitchBackPopupDismissed`,
);

export const setNewNavigationEnabled = (enabled: boolean) => {
    if (enabled) {
        storedOptInPopupDismissed.set(true);
    }
    storedOptIn.set(enabled);
};

const dismissOptInPopup = () => storedOptInPopupDismissed.set(true);

const dismissSwitchBackPopup = () => storedSwitchBackPopupDismissed.set(true);

type NewNavigationState = 'unavailable' | 'classic' | 'new';

export const useNewNavigation = () => {
    const available = Boolean(useUiFlag('improvedSidebarNavigation'));
    const optedIn = useStoredFlag(storedOptIn);
    const optInPopupDismissed = useStoredFlag(storedOptInPopupDismissed);
    const switchBackPopupDismissed = useStoredFlag(
        storedSwitchBackPopupDismissed,
    );

    const navigation: NewNavigationState = !available
        ? 'unavailable'
        : optedIn
          ? 'new'
          : 'classic';

    return {
        navigation,
        setEnabled: setNewNavigationEnabled,
        showOptInPopup: navigation === 'classic' && !optInPopupDismissed,
        dismissOptInPopup,
        showSwitchBackPopup: navigation === 'new' && !switchBackPopupDismissed,
        dismissSwitchBackPopup,
    };
};
