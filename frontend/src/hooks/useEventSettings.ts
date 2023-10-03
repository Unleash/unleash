import { basePath } from 'utils/formatPath';
import { createPersistentGlobalStateHook } from './usePersistentGlobalState';
import React from 'react';

export interface IEventSettings {
    showData: boolean;
}

interface IUseEventSettingsOutput {
    eventSettings: IEventSettings;
    setEventSettings: React.Dispatch<React.SetStateAction<IEventSettings>>;
}

export const useEventSettings = (): IUseEventSettingsOutput => {
    const [eventSettings, setEventSettings] = useGlobalState();

    return { eventSettings, setEventSettings };
};

const createInitialValue = (): IEventSettings => {
    return { showData: false };
};

const useGlobalState = createPersistentGlobalStateHook<IEventSettings>(
    `${basePath}:useEventSettings:v1`,
    createInitialValue()
);
