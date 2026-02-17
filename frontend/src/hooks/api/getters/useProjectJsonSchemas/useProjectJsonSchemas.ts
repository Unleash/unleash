import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { IProjectJsonSchema } from 'interfaces/jsonSchema';

export const useProjectJsonSchemas = (
    project: string,
    options: SWRConfiguration = {},
) => {
    const path = formatApiPath(`api/admin/projects/${project}/json-schemas`);
    const { data, error, mutate } = useSWR<{
        jsonSchemas: IProjectJsonSchema[];
    }>(path, fetcher, options);

    const jsonSchemas = useMemo(() => {
        return data?.jsonSchemas ?? [];
    }, [data]);

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        jsonSchemas,
        error,
        loading: !error && !data,
        refetch,
    };
};

const fetcher = async (
    path: string,
): Promise<{ jsonSchemas: IProjectJsonSchema[] }> => {
    const res = await fetch(path).then(
        handleErrorResponses('Project JSON schemas'),
    );
    return res.json();
};
