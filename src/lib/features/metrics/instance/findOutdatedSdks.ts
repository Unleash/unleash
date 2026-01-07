import semver from 'semver';

type SDKConfig = {
    [key: string]: string;
};

const config: SDKConfig = {
    'unleash-client-node': '5.3.2',
    'unleash-client-nextjs': '1.6.2',
    'unleash-client-java': '9.2.0',
    'unleash-client-go': '4.1.0',
    'unleash-client-python': '5.11.0',
    'unleash-client-ruby': '5.0.0',
    'unleash-client-dotnet': '4.1.3',
    'unleash-client-php': '2.3.0',
    // new values after sdk registration rename:
    'unleash-node-sdk': '6.6.0',
    'unleash-nextjs-sdk': '1.6.2',
    'unleash-java-sdk': '11.0.2',
    'unleash-go-sdk': '5.0.3',
    'unleash-python-sdk': '6.3.0',
    'unleash-ruby-sdk': '6.3.1',
    'unleash-dotnet-sdk': '5.3.0',
    'unleash-php-sdk': '2.9.1',
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
