import { ReactNode } from 'react';

export interface IUiConfig {
    authenticationType?: string;
    baseUriPath?: string;
    flags: IFlags;
    name: string;
    slogan: string;
    environment?: string;
    unleashUrl?: string;
    version: string;
    versionInfo?: IVersionInfo;
    links: ILinks[];
    disablePasswordAuth?: boolean;
    emailEnabled?: boolean;
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

export interface IFlags {
    C: boolean;
    P: boolean;
    E: boolean;
    RE: boolean;
    EEA?: boolean;
    OIDC?: boolean;
    CO?: boolean;
    SE?: boolean;
    T?: boolean;
    UNLEASH_CLOUD?: boolean;
    UG?: boolean;
    ENABLE_DARK_MODE_SUPPORT?: boolean;
    embedProxyFrontend?: boolean;
    publicSignup?: boolean;
    personalAccessTokens?: boolean;
    syncSSOGroups?: boolean;
}

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
