import React, { useState } from 'react';
import UIContext, { createEmptyToast, themeMode } from 'contexts/UIContext';
import { IToast } from 'interfaces/toast';
import { getLocalStorageItem } from 'utils/storage';

const resolveMode = (darkmode: boolean): themeMode => {
    const value = getLocalStorageItem('unleash-theme');
    if (value) {
        return value as themeMode;
    }

    let osDark;
    if (darkmode) {
        osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (osDark) {
        return 'dark';
    }
    return 'light';
};

interface IUiProviderProps {
    darkmode: boolean;
}

const UIProvider: React.FC<IUiProviderProps> = ({
    children,
    darkmode = false,
}) => {
    const [toastData, setToast] = useState<IToast>(createEmptyToast());
    const [showFeedback, setShowFeedback] = useState(false);
    const [themeMode, setThemeMode] = useState(resolveMode(darkmode));

    const context = React.useMemo(
        () => ({
            setToast,
            toastData,
            showFeedback,
            setShowFeedback,
            themeMode,
            setThemeMode,
        }),
        [toastData, showFeedback, themeMode]
    );

    return <UIContext.Provider value={context}>{children}</UIContext.Provider>;
};

export default UIProvider;
