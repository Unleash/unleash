import React from 'react';
import { IToast } from 'interfaces/toast';

interface IUIContext {
    toastData: IToast;
    setToast: React.Dispatch<React.SetStateAction<IToast>>;
    showFeedback: boolean;
    setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
}

export const createEmptyToast = (): IToast => {
    return {
        title: '',
        text: '',
        components: [],
        show: false,
        persist: false,
        type: '',
    };
};

const setToastPlaceholder = () => {
    throw new Error('setToast called outside UIContext');
};

const setShowFeedbackPlaceholder = () => {
    throw new Error('setShowFeedback called outside UIContext');
};

const UIContext = React.createContext<IUIContext>({
    toastData: createEmptyToast(),
    setToast: setToastPlaceholder,
    showFeedback: false,
    setShowFeedback: setShowFeedbackPlaceholder,
});

export default UIContext;
