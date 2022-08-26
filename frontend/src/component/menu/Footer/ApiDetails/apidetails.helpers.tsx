import { IVersionInfo } from 'interfaces/uiConfig';

export interface IPartialUiConfig {
    name: string;
    version: string;
    slogan?: string;
    environment?: string;
    versionInfo?: IVersionInfo;
}

export const formatCurrentVersion = (uiConfig: IPartialUiConfig): string => {
    const current = uiConfig.versionInfo?.current;

    if (current?.enterprise) {
        return `${uiConfig.name} ${current.enterprise}`;
    }

    if (current?.oss) {
        return `${uiConfig.name} ${current.oss}`;
    }

    return `${uiConfig.name} ${uiConfig.version}`;
};

export const formatUpdateNotification = (
    uiConfig: IPartialUiConfig
): string | undefined => {
    const latest = uiConfig.versionInfo?.latest;
    const isLatest = uiConfig.versionInfo?.isLatest;

    if (latest?.enterprise && !isLatest) {
        return `Upgrade available - Latest Enterprise release: ${latest.enterprise}`;
    }

    if (latest?.oss && !isLatest) {
        return `Upgrade available - Latest OSS release: ${latest.oss}`;
    }
};
