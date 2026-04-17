import { createContext, useContext } from 'react';

type ImpactMetricRegistrationContextType = {
    openRegisterDialog: () => void;
};

const ImpactMetricRegistrationContext = createContext<
    ImpactMetricRegistrationContextType | undefined
>(undefined);

export const ImpactMetricRegistrationProvider =
    ImpactMetricRegistrationContext.Provider;

export const useRegisterImpactMetric = () =>
    useContext(ImpactMetricRegistrationContext);
