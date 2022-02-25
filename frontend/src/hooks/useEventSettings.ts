import { getBasePath } from '../utils/format-path';
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
    `${getBasePath()}:useEventSettings:v1`,
    createInitialValue()
);
