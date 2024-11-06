import type { IVersionInfo } from 'interfaces/uiConfig';

export interface IPartialUiConfig {
    name: string;
    version: string;
    slogan?: string;
    environment?: string;
    billing?: string;
    versionInfo?: IVersionInfo;
}

export const formatCurrentVersion = (
    uiConfig: IPartialUiConfig,
): { name: string; version: string; buildNumber?: string } => {
    const current = uiConfig.versionInfo?.current;
    const [version, buildNumber] = (
        current?.enterprise ||
        current?.oss ||
        uiConfig.version ||
        ''
    ).split('+');
    return {
        name: uiConfig.name,
        version,
        buildNumber,
    };
};

export const formatUpdateNotification = (
    uiConfig: IPartialUiConfig,
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
