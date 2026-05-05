import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';

const PATH = `api/admin/remote-mcp/settings`;

export type RemoteMcpSettings = {
    enabled: boolean;
};

const DEFAULT_DATA: RemoteMcpSettings = {
    enabled: false,
};

export const useRemoteMcpSettings = () => {
    const { data, refetch, loading, error } = useApiGetter<RemoteMcpSettings>(
        formatApiPath(PATH),
        () => fetcher(formatApiPath(PATH), 'Remote MCP settings'),
    );

    return {
        settings: data ?? DEFAULT_DATA,
        refetch,
        loading,
        error,
    };
};
