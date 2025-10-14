import type { ReactNode } from 'react';

export type OnFeatureToggleSwitchArgs = {
    featureId: string;
    projectId: string;
    environmentName: string;
    environmentType?: string;
    hasStrategies?: boolean;
    hasReleasePlans?: boolean;
    hasEnabledStrategies?: boolean;
    isChangeRequestEnabled?: boolean;
    onRollback?: () => void;
    onSuccess?: () => void;
};

export type UseFeatureToggleSwitchType = (projectId: string) => {
    modals: ReactNode;
    onToggle: (newState: boolean, config: OnFeatureToggleSwitchArgs) => void;
};
