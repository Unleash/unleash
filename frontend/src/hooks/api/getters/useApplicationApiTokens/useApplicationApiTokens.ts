import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { useHasRootAccess } from 'hooks/useHasAccess';
import {
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
} from '@server/types/permissions';
import type { ApiTokensSchema } from 'openapi';
import { fetcher } from '../useApiGetter/useApiGetter.js';

export const useApplicationApiTokens = (appName: string) => {
    const readsBackendTokens = useHasRootAccess(READ_CLIENT_API_TOKEN);
    const readsFrontendTokens = useHasRootAccess(READ_FRONTEND_API_TOKEN);
    const hiddenTokenTypes: ('backend' | 'frontend')[] = [
        ...(readsBackendTokens ? [] : ['backend' as const]),
        ...(readsFrontendTokens ? [] : ['frontend' as const]),
    ];
    const forbidden = hiddenTokenTypes.length === 2;

    const { data, error, mutate } = useSWR<ApiTokensSchema>(
        forbidden
            ? null
            : formatApiPath(
                  `api/admin/api-tokens?appName=IS:${encodeURIComponent(appName)}`,
              ),
        (path: string) => fetcher(path, 'Application API tokens'),
    );

    return {
        tokens: data?.tokens ?? [],
        loading: !forbidden && !error && !data,
        forbidden,
        hiddenTokenTypes,
        error: data ? undefined : error,
        refetch: () => mutate(),
    };
};
