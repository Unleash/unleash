export interface IUiConfig {
    authenticationType: string;
    baseUriPath: string;
    flags: IFlags;
    name: string;
    slogan: string;
    unleashUrl: string;
    version: string;
    versionInfo: IVersionInfo;
    links: ILinks[];
    disablePasswordAuth?: boolean;
    toast?: IProclamationToast;
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
    icon: string;
    href: string;
    title: string;
}
