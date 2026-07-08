import type { ReactNode } from 'react';
import type { Variant } from 'utils/variants';
import type { ResourceLimitsSchema } from 'openapi';
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
    edgeUrl?: string;
    logRocketAppId?: string;
    version: string;
    versionInfo?: IVersionInfo;
    links: ILinks[];
    disablePasswordAuth?: boolean;
    emailEnabled?: boolean;
    prometheusAPIAvailable: boolean;
    impactMetrics?:
        | 'disabled'
        | 'unconfigured'
        | 'external'
        | 'internal'
        | 'full';
    maintenanceMode?: boolean;
    frontendApiOrigins?: string[];
    resourceLimits: ResourceLimitsSchema;
    oidcConfiguredThroughEnv?: boolean;
    samlConfiguredThroughEnv?: boolean;
    maxSessionsCount?: number;
    unleashContext?: IMutableContext;
    storiesPageEnabled?: boolean;
}

export type UiFlags = {
    P: boolean;
    RE: boolean;
    EEA?: boolean;
    SE?: boolean;
    T?: boolean;
    UNLEASH_CLOUD?: boolean;
    UG?: boolean;
    maintenanceMode?: boolean | Variant;
    messageBanner?: Variant;
    banner?: Variant;
    notifications?: boolean;
    personalAccessTokensKillSwitch?: boolean;
    demo?: boolean;
    interactiveDemoKillSwitch?: boolean;
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
    featureLifecycle?: boolean;
    manyStrategiesPagination?: boolean;
    enableLegacyVariants?: boolean;
    flagCreator?: boolean;
    productivityReportEmail?: boolean;
    showUserDeviceCount?: boolean;
    sessionInspector?: boolean;
    consumptionModel?: boolean;
    consumptionModelUI?: boolean;
    customMetrics?: boolean;
    disableImpactMetrics?: boolean;
    impactViews?: boolean;
    registerImpactMetrics?: boolean;
    plausibleMetrics?: boolean;
    oidcPkceSupport?: boolean;
    extendedUsageMetrics?: boolean;
    newInUnleash?: boolean | Variant;
    whatsNewPage?: boolean;
    flagListCreatedByFilter?: boolean;
    regexConstraintOperator?: boolean;
    semverGteConstraintOperators?: boolean;
    signupDialog?: boolean;
    enterpriseEdgeTokensList?: boolean;
    impactMetricsFlagPage?: boolean;
    multiMetricChart?: boolean;
    logRocketEnabled?: boolean;
    newProjectList?: boolean;
    newModalDesign?: boolean;
    archiveInFlagsView?: boolean;
    newProfileDropdown?: boolean;
    learningLab?: Variant;
    accessRequestsNotifications?: boolean;
    flightRecorderFrontend?: Variant;
    accessRequestsMenuIndicator?: boolean;
    projectReleaseTemplates?: boolean;
    topLabelInputs?: boolean;
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
