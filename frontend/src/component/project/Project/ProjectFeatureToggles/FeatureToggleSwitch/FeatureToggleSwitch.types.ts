import type { ReactNode } from 'react';

export type OnFeatureToggleSwitchArgs = {
    featureId: string;
    projectId: string;
    environmentName: string;
    environmentType?: string;
    hasStrategies?: boolean;
    hasEnabledStrategies?: boolean;
    hasReleasePlans?: boolean;
    isChangeRequestEnabled?: boolean;
    onRollback?: () => void;
    onSuccess?: () => void;
};

export type UseFeatureToggleSwitchType = (projectId: string) => {
    modals: ReactNode;
    onToggle: (newState: boolean, config: OnFeatureToggleSwitchArgs) => void;
};
