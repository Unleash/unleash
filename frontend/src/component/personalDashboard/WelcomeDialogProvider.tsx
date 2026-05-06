import {
    type Dispatch,
    type SetStateAction,
    type ReactNode,
    useEffect,
} from 'react';
import { WelcomeDialogContext } from './WelcomeDialogContext.tsx';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';

type DialogState = 'open' | 'closed';

export interface IWelcomeDialogContext {
    welcomeDialog: DialogState;
    setWelcomeDialog: Dispatch<SetStateAction<DialogState>>;
    onClose: () => void;
    isLoggedIn: boolean;
    hasSeenKeyConcepts: boolean;
}

interface IWelcomeDialogProviderProps {
    children: ReactNode;
}

export const WelcomeDialogProvider = ({
    children,
}: IWelcomeDialogProviderProps) => {
    const { splash } = useAuthSplash();
    const { setSplashSeen } = useSplashApi();

    let defaultDialogState: DialogState = splash?.personalDashboardKeyConcepts
        ? 'closed'
        : 'open';

    const onboardingKeyConceptsNudge = useUiFlag('onboardingKeyConceptsNudge');
    if (onboardingKeyConceptsNudge) {
        defaultDialogState = 'closed';
    }

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<DialogState>(
        'welcome-dialog:v1',
        defaultDialogState,
    );

    useEffect(() => {
        if (splash?.personalDashboardKeyConcepts && welcomeDialog === 'open') {
            setWelcomeDialog('closed');
        }
    }, [splash?.personalDashboardKeyConcepts]);

    const onClose = () => {
        setSplashSeen('personalDashboardKeyConcepts');
        setWelcomeDialog('closed');
    };

    const contextValue: IWelcomeDialogContext = {
        welcomeDialog,
        setWelcomeDialog,
        onClose,
        isLoggedIn: Boolean(splash),
        hasSeenKeyConcepts: Boolean(splash?.personalDashboardKeyConcepts),
    };

    return (
        <WelcomeDialogContext.Provider value={contextValue}>
            {children}
        </WelcomeDialogContext.Provider>
    );
};
