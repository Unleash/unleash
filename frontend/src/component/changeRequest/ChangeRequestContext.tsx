import { createContext, useContext } from 'react';

const defaultContext = {
    willOverwriteStrategyChanges: false,
    registerConflicts: () => {},
};

const ChangeRequestConflictContext = createContext(defaultContext);

export const ChangeRequestConflictProvider =
    ChangeRequestConflictContext.Provider;

export const useChangeRequestConflictContext = (): typeof defaultContext => {
    return useContext(ChangeRequestConflictContext);
};
