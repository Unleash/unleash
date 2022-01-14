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
interface IFeatureStrategiesUIContext {
    toastData: IToastData;
    setToast: React.Dispatch<React.SetStateAction<IToastData>>;
}

const UIContext = React.createContext<IFeatureStrategiesUIContext | null>(null);

export default UIContext;
