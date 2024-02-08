import { createContext, useContext } from 'react';

const defaultContext = {
    willOverwriteStrategyChanges: false,
    registerWillOverwriteStrategyChanges: () => {},
};

const ChangeRequestPlausibleContext = createContext(defaultContext);

export const ChangeRequestPlausibleProvider =
    ChangeRequestPlausibleContext.Provider;

export const useChangeRequestPlausibleContext = (): typeof defaultContext => {
    return useContext(ChangeRequestPlausibleContext);
};
