import React, { useState } from 'react';
import UIContext, {
    createEmptyToast,
    type themeMode,
} from 'contexts/UIContext';
import type { IToast } from 'interfaces/toast';
import { getLocalStorageItem } from 'utils/storage';

const resolveMode = (): themeMode =>
    getLocalStorageItem<themeMode>('unleash-theme') ?? 'system';

const UIProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [toastData, setToast] = useState<IToast>(createEmptyToast());
    const [showFeedback, setShowFeedback] = useState(false);
    const [themeMode, setThemeMode] = useState(resolveMode());

    const context = React.useMemo(
        () => ({
            setToast,
            toastData,
            showFeedback,
            setShowFeedback,
            themeMode,
            setThemeMode,
        }),
        [toastData, showFeedback, themeMode],
    );

    return <UIContext.Provider value={context}>{children}</UIContext.Provider>;
};

export default UIProvider;
