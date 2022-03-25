import { getBasePath } from 'utils/formatPath';
import { createPersistentGlobalStateHook } from './usePersistentGlobalState';
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

const useGlobalState = createPersistentGlobalStateHook<ILocationSettings>(
    `${getBasePath()}:useLocationSettings:v1`,
    createInitialValue()
);
