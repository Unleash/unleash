import { useMemo } from 'react';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import type { ProjectApplicationsSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';
import type { SdkName } from 'component/onboarding/dialog/sharedTypes';

const sdkPackageToName: Record<string, SdkName> = {
    'unleash-client-node': 'Node.js',
    'unleash-node-sdk': 'Node.js',
    'unleash-client-nextjs': 'Node.js',
    'unleash-nextjs-sdk': 'Node.js',
    'unleash-client-java': 'Java',
    'unleash-java-sdk': 'Java',
    'unleash-client-go': 'Go',
    'unleash-go-sdk': 'Go',
    'unleash-client-python': 'Python',
    'unleash-python-sdk': 'Python',
    'unleash-client-ruby': 'Ruby',
    'unleash-ruby-sdk': 'Ruby',
    'unleash-client-dotnet': '.NET',
    'unleash-dotnet-sdk': '.NET',
    'unleash-client-php': 'PHP',
    'unleash-php-sdk': 'PHP',
    'unleash-api-client': 'Rust',
    'unleash-proxy-client': 'JavaScript',
    '@unleash/proxy-client-react': 'React',
    '@unleash/proxy-client-vue': 'Vue',
    '@unleash/proxy-client-svelte': 'Svelte',
    UnleashProxyClientSwift: 'Swift',
    'unleash-android': 'Android',
    unleash_proxy_client_flutter: 'Flutter',
};

export const extractSdkNames = (
    applications: ProjectApplicationsSchema['applications'],
): SdkName[] => {
    const seen = new Set<SdkName>();
    const result: SdkName[] = [];
    for (const app of applications) {
        for (const sdk of app.sdks) {
            const sdkName = sdkPackageToName[sdk.name];
            if (sdkName && !seen.has(sdkName)) {
                seen.add(sdkName);
                result.push(sdkName);
            }
        }
    }
    return result;
};

export const useProjectSdkNamesFromFirstApplicationsPage = (
    projectId: string,
): { sdkNames: SdkName[]; loading: boolean } => {
    const PATH = `api/admin/projects/${projectId}/applications?limit=25`;
    const { data, loading } = useApiGetter<ProjectApplicationsSchema>(
        formatApiPath(PATH),
        () => fetcher(formatApiPath(PATH), 'Project Applications'),
    );

    const sdkNames = useMemo(
        () => extractSdkNames(data?.applications ?? []),
        [data],
    );

    return { sdkNames, loading };
};
