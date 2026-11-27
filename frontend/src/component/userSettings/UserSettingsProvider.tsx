import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import type { IUiConfig } from 'interfaces/uiConfig';
import { applyServerSettings } from './applyServerSettings.ts';
import type { ServerBackedKey } from './serverBackedKeys.ts';
import { type LoadSettingsResult, loadSettings } from './userSettingsClient.ts';

export type UserSettingsStatus = 'pending' | LoadSettingsResult['status'];

const UserSettingsStatusContext = createContext<UserSettingsStatus>('off');

const areFlagsForUser = (uiConfig: IUiConfig, userId: number) =>
    String(uiConfig.unleashContext?.userId) === String(userId);

// Just after sign-in, ui-config may still hold the flags from before sign-in.
// If the flags are already for this user, use them. If not, fetch ui-config
// one more time and use whatever comes back, even if it fails, so the app
// never waits forever.
const useAreUserFlagsReady = (userId: number | undefined): boolean => {
    const { uiConfig, loading, refetch } = useUiConfig();
    const [isRefetchSettled, setIsRefetchSettled] = useState(false);
    const isSignedIn = userId !== undefined;
    const areForUser = isSignedIn && areFlagsForUser(uiConfig, userId);

    useEffect(() => {
        if (!isSignedIn) {
            setIsRefetchSettled(false);
            return;
        }
        if (areForUser || loading || isRefetchSettled) {
            return;
        }
        const markRefetchSettled = () => setIsRefetchSettled(true);
        refetch().then(markRefetchSettled, markRefetchSettled);
    }, [isSignedIn, areForUser, loading, isRefetchSettled, refetch]);

    return areForUser || (isSignedIn && isRefetchSettled);
};

const applyLoadedSettings = (
    result: LoadSettingsResult,
    keys: ServerBackedKey[],
) => {
    if (result.status === 'loaded') {
        applyServerSettings(result.settings, keys);
    }
};

export const UserSettingsProvider = ({
    keys,
    children,
}: {
    keys: ServerBackedKey[];
    children: ReactNode;
}) => {
    const { user } = useAuthUser();
    const areFlagsReady = useAreUserFlagsReady(user?.id);
    const isEnabled = useUiFlag('userSettings');
    const [status, setStatus] = useState<UserSettingsStatus>('pending');

    useEffect(() => {
        if (!areFlagsReady) {
            setStatus('pending');
            return;
        }
        if (!isEnabled) {
            setStatus('off');
            return;
        }
        let isCurrent = true;
        loadSettings().then((result) => {
            if (isCurrent) {
                applyLoadedSettings(result, keys);
                setStatus(result.status);
            }
        });
        return () => {
            isCurrent = false;
        };
    }, [areFlagsReady, isEnabled, keys]);

    return (
        <UserSettingsStatusContext.Provider value={status}>
            {children}
        </UserSettingsStatusContext.Provider>
    );
};

export const useUserSettingsStatus = () =>
    useContext(UserSettingsStatusContext);
