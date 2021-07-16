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
}

export interface IFlags {
    C: boolean;
    P: boolean;
}

export interface IVersionInfo {
    instanceId: string;
    isLatest: boolean;
    latest: Object;
    current: ICurrent;
}

export interface ICurrent {
    oss: string;
    enterprise: string;
}

export interface ILinks {
    value: string;
    icon: string;
    href: string;
    title: string;
}
