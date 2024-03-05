import { ReactNode } from 'react';
import { Variant } from 'utils/variants';

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
    unleashUrl?: string;
    version: string;
    versionInfo?: IVersionInfo;
    links: ILinks[];
    disablePasswordAuth?: boolean;
    emailEnabled?: boolean;
    networkViewEnabled: boolean;
    maintenanceMode?: boolean;
    toast?: IProclamationToast;
    segmentValuesLimit?: number;
    strategySegmentsLimit?: number;
    frontendApiOrigins?: string[];
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
    featuresExportImport?: boolean;
    caseInsensitiveInOperators?: boolean;
    proPlanAutoCharge?: boolean;
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
    increaseUnleashWidth?: boolean;
    featureSearchFeedback?: Variant;
    enableLicense?: boolean;
    newStrategyConfigurationFeedback?: boolean;
    extendedUsageMetricsUI?: boolean;
    adminTokenKillSwitch?: boolean;
    executiveDashboard?: boolean;
    feedbackComments?: Variant;
    displayUpgradeEdgeBanner?: boolean;
    showInactiveUsers?: boolean;
    featureSearchFeedbackPosting?: boolean;
    userAccessUIEnabled?: boolean;
    sdkReporting?: boolean;
};

export interface IVersionInfo {
    instanceId: string;
    isLatest: boolean;
    latest: Partial<IVersion>;
    current: IVersion;
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
