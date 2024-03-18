import semver from 'semver';

type SDKConfig = {
    [key: string]: string;
};

const config: SDKConfig = {
    'unleash-client-node': '5.3.2',
    'unleash-client-java': '9.2.0',
    'unleash-client-go': '4.1.0',
    'unleash-client-python': '5.11.0',
    'unleash-client-ruby': '5.0.0',
    'unleash-client-dotnet': '4.1.3',
    'unleash-client-php': '2.3.0',
};

export const isOutdatedSdk = (sdkVersion: string | null): boolean => {
    if (!sdkVersion) return false;

    const [sdkName, version] = sdkVersion.split(':');
    const minVersion = config[sdkName];

    return Boolean(
        minVersion && semver.valid(version) && semver.lt(version, minVersion),
    );
};

export function findOutdatedSDKs(sdkVersions: (string | null)[]): string[] {
    const uniqueSdkVersions = Array.from(new Set(sdkVersions));

    return uniqueSdkVersions.filter(isOutdatedSdk) as string[];
}
