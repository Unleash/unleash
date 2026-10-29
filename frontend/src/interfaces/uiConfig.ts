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
    hubspotPortalId?: string;
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
    sessionKeepAliveIntervalSeconds?: number;
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
    onboardingIntroTourAdvancedTopics?: boolean;
    interactiveDemoKillSwitch?: boolean;
    advancedPlayground?: boolean;
    strategyVariant?: boolean;
    doraMetrics?: boolean;
    dependentFeatures?: boolean;
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
    consumptionModel?: boolean;
    consumptionModelUI?: boolean;
    disableImpactMetrics?: boolean;
    impactViews?: boolean;
    oidcPkceSupport?: boolean;
    extendedUsageMetrics?: boolean;
    regexConstraintOperator?: boolean;
    signupDialog?: boolean;
    enterpriseEdgeTokensList?: boolean;
    impactMetricsFlagPage?: boolean;
    uxTweakSurveys?: boolean;
    multiMetricChart?: boolean;
    logRocketEnabled?: boolean;
    hubspotChatEnabled?: boolean;
    learningLab?: Variant;
    flightRecorderFrontend?: Variant;
    searchDocsWidget?: boolean;
    semverBuildMetadata?: boolean;
    helpMenuRelocationHint?: boolean;
    ipConstraintOperator?: boolean;
    githubIntegration?: boolean;
    integrationParamKvpEditor?: boolean;
    perFlagLifetime?: boolean;
    sessionTimeouts?: boolean;
    payloadSchemas?: boolean;
    singlePageStrategyForm?: boolean;
    feedbackModule?: boolean;
    feedbackModuleDisplaySurvey?: boolean;
    playgroundFeatureEvaluation?: boolean;
    dashboardV2?: boolean;
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
