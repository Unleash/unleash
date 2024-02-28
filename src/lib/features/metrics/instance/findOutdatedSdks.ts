import semver from 'semver';

type SDKConfig = {
    [key: string]: string;
};

const config: SDKConfig = {
    'unleash-client-node': '4.1.0',
    'unleash-client-java': '8.3.0',
    'unleash-client-go': '3.8.0',
    'unleash-client-python': '5.8.0',
    'unleash-client-ruby': '4.5.0',
    'unleash-client-dotnet': '3.3.0',
    'unleash-client-php': '1.13.0',
};

export function findOutdatedSDKs(sdkVersions: string[]): string[] {
    const uniqueSdkVersions = Array.from(new Set(sdkVersions));
    const outdatedSDKs: string[] = [];

    return uniqueSdkVersions.filter((sdkVersion) => {
        const result = sdkVersion.split(':');
        if (result.length !== 2) return false;
        const [sdkName, version] = result;
        const minVersion = config[sdkName];
        if (!minVersion) return false;
        if (semver.lt(version, minVersion)) return true;
        return false;
    });
}
