import { getBasePath } from '../utils/format-path';
import { createPersistentGlobalState } from './usePersistentGlobalState';
import React from 'react';

export interface ILocationSettings {
    locale: string;
}

interface IUseLocationSettingsOutput {
    locationSettings: ILocationSettings;
    setLocationSettings: React.Dispatch<
        React.SetStateAction<ILocationSettings>
    >;
}

export const useLocationSettings = (): IUseLocationSettingsOutput => {
    const [locationSettings, setLocationSettings] = useGlobalState();

    return { locationSettings, setLocationSettings };
};

const createInitialValue = (): ILocationSettings => {
    return { locale: navigator.language };
};

const useGlobalState = createPersistentGlobalState<ILocationSettings>(
    `${getBasePath()}:useLocationSettings:v1`,
    createInitialValue()
);
