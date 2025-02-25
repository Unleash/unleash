import type { ReactNode } from 'react';
import type { Variant } from 'utils/variants';
import type { ResourceLimitsSchema } from '../openapi';

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
    billing?: 'subscription' | 'pay-as-you-go';
    unleashUrl?: string;
    version: string;
    versionInfo?: IVersionInfo;
    links: ILinks[];
    disablePasswordAuth?: boolean;
    emailEnabled?: boolean;
    prometheusAPIAvailable: boolean;
    maintenanceMode?: boolean;
    toast?: IProclamationToast;
    segmentValuesLimit?: number;
    strategySegmentsLimit?: number;
    frontendApiOrigins?: string[];
    resourceLimits: ResourceLimitsSchema;
    oidcConfiguredThroughEnv?: boolean;
    samlConfiguredThroughEnv?: boolean;
    maxSessionsCount?: number;
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
    embedProxyFrontend?: boolean;
    maintenanceMode?: boolean;
    messageBanner?: Variant;
    banner?: Variant;
    caseInsensitiveInOperators?: boolean;
    notifications?: boolean;
    personalAccessTokensKillSwitch?: boolean;
    demo?: boolean;
    googleAuthEnabled?: boolean;
    disableBulkToggle?: boolean;
    disableNotifications?: boolean;
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
    userAccessUIEnabled?: boolean;
    outdatedSdksBanner?: boolean;
    estimateTrafficDataCost?: boolean;
    disableShowContextFieldSelectionValues?: boolean;
    projectOverviewRefactorFeedback?: boolean;
    featureLifecycle?: boolean;
    manyStrategiesPagination?: boolean;
    enableLegacyVariants?: boolean;
    flagCreator?: boolean;
    releasePlans?: boolean;
    releasePlanChangeRequests?: boolean;
    'enterprise-payg'?: boolean;
    productivityReportEmail?: boolean;
    showUserDeviceCount?: boolean;
    flagOverviewRedesign?: boolean;
    granularAdminPermissions?: boolean;
    frontendHeaderRedesign?: boolean;
    dataUsageMultiMonthView?: boolean;
    uiGlobalFontSize?: boolean;
    connectionCount?: boolean;
    edgeObservability?: boolean;
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
