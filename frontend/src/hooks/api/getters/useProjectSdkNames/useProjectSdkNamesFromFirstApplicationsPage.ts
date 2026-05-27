import { useMemo } from 'react';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import type { ProjectApplicationsSchema } from 'openapi';
import { formatApiPath } from 'utils/formatPath';
import type { SdkName } from 'component/onboarding/dialog/sharedTypes';

// Order matters: more specific patterns must come before broader ones.
// e.g.: 'react'/'vue'/'svelte' before 'proxy-client',
// e.g.: 'javascript' before 'java'.
const sdkPatterns: [string, SdkName][] = [
    ['react', 'React'],
    ['svelte', 'Svelte'],
    ['vue', 'Vue'],
    ['javascript', 'JavaScript'],
    ['proxy-client', 'JavaScript'],
    ['client-js', 'JavaScript'],
    ['node', 'Node.js'],
    ['java', 'Java'],
    ['go', 'Go'],
    ['python', 'Python'],
    ['ruby', 'Ruby'],
    ['dotnet', '.NET'],
    ['php', 'PHP'],
    ['rust', 'Rust'],
    ['ios', 'Swift'],
    ['swift', 'Swift'],
    ['android', 'Android'],
    ['flutter', 'Flutter'],
];

const resolveSdkName = (packageName: string): SdkName | undefined => {
    const lower = packageName.toLowerCase();
    return sdkPatterns.find(([pattern]) => lower.includes(pattern))?.[1];
};

export const extractSdkNames = (
    applications: ProjectApplicationsSchema['applications'],
): SdkName[] => {
    const seen = new Set<SdkName>();
    const result: SdkName[] = [];
    for (const app of applications) {
        for (const sdk of app.sdks) {
            const sdkName = resolveSdkName(sdk.name);
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
