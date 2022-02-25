import React, { useState } from 'react';
import UIContext, { createEmptyToast } from '../../../contexts/UIContext';
import { IToast } from '../../../interfaces/toast';

const UIProvider: React.FC = ({ children }) => {
    const [toastData, setToast] = useState<IToast>(createEmptyToast());
    const [showFeedback, setShowFeedback] = useState(false);

    const context = React.useMemo(
        () => ({
            setToast,
            toastData,
            showFeedback,
            setShowFeedback,
        }),
        [toastData, showFeedback]
    );

    return <UIContext.Provider value={context}>{children}</UIContext.Provider>;
};

export default UIProvider;
