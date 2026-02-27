import type { Dispatch, SetStateAction, ReactNode } from 'react';
import { WelcomeDialogContext } from './WelcomeDialogContext.tsx';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

type DialogState = 'open' | 'closed';

export interface IWelcomeDialogContext {
    welcomeDialog: DialogState;
    setWelcomeDialog: Dispatch<SetStateAction<DialogState>>;
    onClose: () => void;
}

interface IWelcomeDialogProviderProps {
    children: ReactNode;
}

export const WelcomeDialogProvider = ({
    children,
}: IWelcomeDialogProviderProps) => {
    const { splash } = useAuthSplash();
    const { setSplashSeen } = useSplashApi();

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<DialogState>(
        'welcome-dialog:v1',
        splash?.personalDashboardKeyConcepts ? 'closed' : 'open',
    );

    const onClose = () => {
        setSplashSeen('personalDashboardKeyConcepts');
        setWelcomeDialog('closed');
    };

    const contextValue: IWelcomeDialogContext = {
        welcomeDialog,
        setWelcomeDialog,
        onClose,
    };

    return (
        <WelcomeDialogContext.Provider value={contextValue}>
            {children}
        </WelcomeDialogContext.Provider>
    );
};
