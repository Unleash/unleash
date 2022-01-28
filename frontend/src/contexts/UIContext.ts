import React from 'react';

export interface IToastData {
    title: string;
    text: string;
    components?: JSX.Element[];
    show: boolean;
    persist: boolean;
    confetti?: boolean;
    type: string;
}
interface IUIContext {
    toastData: IToastData;
    setToast: React.Dispatch<React.SetStateAction<IToastData>>;
    showFeedback: boolean;
    setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
}

const UIContext = React.createContext<IUIContext | null>(null);

export default UIContext;
