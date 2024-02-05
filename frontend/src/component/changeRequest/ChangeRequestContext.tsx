import { createContext, useContext } from 'react';
import { ChangeRequestState } from './changeRequest.types';

export type PlausibleChangeRequestState =
    | Exclude<ChangeRequestState, 'Scheduled'>
    | 'Scheduled pending'
    | 'Scheduled failed'
    | 'Scheduled suspended';

const defaultContext = {
    willOverwriteStrategyChanges: false,
    registerWillOverwriteStrategyChanges: () => {},
    previousState: 'Draft' as PlausibleChangeRequestState,
};

const ChangeRequestPlausibleContext = createContext(defaultContext);

export const ChangeRequestPlausibleProvider =
    ChangeRequestPlausibleContext.Provider;

export const useChangeRequestPlausibleContext = (): typeof defaultContext => {
    return useContext(ChangeRequestPlausibleContext);
};
