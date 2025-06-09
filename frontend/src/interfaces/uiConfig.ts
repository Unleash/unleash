import type { ReactNode } from 'react';
import type { Variant } from 'utils/variants';
import type { ResourceLimitsSchema } from 'openapi';
import {} from '@unleash/proxy-client-react/dist/FlagContext';
import type { IMutableContext } from 'unleash-proxy-client';

export interface IUiConfig {
    authenticationType?: string;
    baseUriPath?: string;
    feedbackUriPath?: string;
    /**
     * @deprecated `useUiFlags` can be used instead
     * @example
     * ```ts
     *   const yourFlag = useUiFlag("yourFlag")
     * ```
     */
    flags: UiFlags;
    name: string;
    slogan: string;
    environment?: string;
    billing?: 'subscription' | 'pay-as-you-go' | 'enterprise-consumption';
    unleashUrl?: string;
    version: string;
    versionInfo?: IVersionInfo;
    links: ILinks[];
    disablePasswordAuth?: boolean;
    emailEnabled?: boolean;
    prometheusAPIAvailable: boolean;
    maintenanceMode?: boolean;
    toast?: IProclamationToast;
    frontendApiOrigins?: string[];
    resourceLimits: ResourceLimitsSchema;
    oidcConfiguredThroughEnv?: boolean;
    samlConfiguredThroughEnv?: boolean;
    maxSessionsCount?: number;
    unleashContext?: IMutableContext;
}

export interface IProclamationToast {
    message: string;
    id: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    link: string;
}

export type UiFlags = {
    P: boolean;
    RE: boolean;
    EEA?: boolean;
    SE?: boolean;
    T?: boolean;
    UNLEASH_CLOUD?: boolean;
    UG?: boolean;
    maintenanceMode?: boolean;
    messageBanner?: Variant;
    banner?: Variant;
    notifications?: boolean;
    personalAccessTokensKillSwitch?: boolean;
    demo?: boolean;
    googleAuthEnabled?: boolean;
    disableBulkToggle?: boolean;
    advancedPlayground?: boolean;
    strategyVariant?: boolean;
    doraMetrics?: boolean;
    dependentFeatures?: boolean;
    newStrategyConfiguration?: boolean;
    signals?: boolean;
    automatedActions?: boolean;
    celebrateUnleash?: boolean;
    enableLicense?: boolean;
    feedbackComments?: Variant;
    showInactiveUsers?: boolean;
    feedbackPosting?: boolean;
    outdatedSdksBanner?: boolean;
    estimateTrafficDataCost?: boolean;
    disableShowContextFieldSelectionValues?: boolean;
    projectOverviewRefactorFeedback?: boolean;
    featureLifecycle?: boolean;
    manyStrategiesPagination?: boolean;
    enableLegacyVariants?: boolean;
    flagCreator?: boolean;
    releasePlans?: boolean;
    'enterprise-payg'?: boolean;
    productivityReportEmail?: boolean;
    showUserDeviceCount?: boolean;
    consumptionModel?: boolean;
    edgeObservability?: boolean;
    addEditStrategy?: boolean;
    registerFrontendClient?: boolean;
    customMetrics?: boolean;
    lifecycleMetrics?: boolean;
    createFlagDialogCache?: boolean;
    sideMenuCleanup?: boolean;
};

export interface IVersionInfo {
    instanceId: string;
    isLatest: boolean;
    latest: Partial<IVersion>;
    current: IVersion;
    buildDate?: string;
}

export interface IVersion {
    oss: string;
    enterprise: string;
}

export interface ILinks {
    value: string;
    icon: ReactNode;
    href: string;
    title: string;
}
