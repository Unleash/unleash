import semver from 'semver';

type SDKConfig = {
    [key: string]: string;
};

const config: SDKConfig = {
    'unleash-client-node': '5.3.2',
    'unleash-client-java': '9.0.0',
    'unleash-client-go': '4.1.0',
    'unleash-client-python': '5.9.2',
    'unleash-client-ruby': '5.0.0',
    'unleash-client-dotnet': '4.1.3',
    'unleash-client-php': '1.13.0',
};

export function findOutdatedSDKs(sdkVersions: string[]): string[] {
    const uniqueSdkVersions = Array.from(new Set(sdkVersions));

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
