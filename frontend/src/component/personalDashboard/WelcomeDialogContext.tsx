import { createContext, useContext } from 'react';
import type { IWelcomeDialogContext } from './WelcomeDialogProvider.tsx';

export const WelcomeDialogContext = createContext<
    IWelcomeDialogContext | undefined
>(undefined);

export const useWelcomeDialogContext = (): IWelcomeDialogContext => {
    const context = useContext(WelcomeDialogContext);

    if (!context) {
        throw new Error(
            'useWelcomeDialogContext must be used within a WelcomeDialogProvider',
        );
    }

    return context;
};
