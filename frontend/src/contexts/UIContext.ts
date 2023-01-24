import React from 'react';
import { IToast } from 'interfaces/toast';

interface IUIContext {
    toastData: IToast;
    setToast: React.Dispatch<React.SetStateAction<IToast>>;
    showFeedback: boolean;
    setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
    setThemeMode: React.Dispatch<React.SetStateAction<themeMode>>;
    themeMode: themeMode;
}

export type themeMode = 'light' | 'dark';

export const createEmptyToast = (): IToast => {
    return {
        type: 'success',
        title: '',
        text: '',
        components: [],
        show: false,
        persist: false,
    };
};

const setToastPlaceholder = () => {
    throw new Error('setToast called outside UIContext');
};

const setShowFeedbackPlaceholder = () => {
    throw new Error('setShowFeedback called outside UIContext');
};

const setThemeModePlaceholder = () => {
    throw new Error('setMode called outside UIContext');
};

const UIContext = React.createContext<IUIContext>({
    toastData: createEmptyToast(),
    setToast: setToastPlaceholder,
    showFeedback: false,
    setShowFeedback: setShowFeedbackPlaceholder,
    themeMode: 'light',
    setThemeMode: setThemeModePlaceholder,
});

export default UIContext;
