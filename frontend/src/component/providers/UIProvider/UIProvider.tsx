import React, { useState } from 'react';

import UIContext, { IToastData } from '../../../contexts/UIContext';

const UIProvider: React.FC = ({ children }) => {
    const [toastData, setToast] = useState<IToastData>({
        title: '',
        text: '',
        components: [],
        show: false,
        persist: false,
        type: '',
    });

    const context = React.useMemo(
        () => ({
            setToast,
            toastData,
        }),
        [toastData]
    );

    return <UIContext.Provider value={context}>{children}</UIContext.Provider>;
};

export default UIProvider;
