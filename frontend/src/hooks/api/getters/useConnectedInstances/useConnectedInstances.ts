import type { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';

type ConnectedInstancesSchema = {
    instances: {
        instanceId: string;
        sdk: string;
        clientIp: string;
        lastSeen: string;
    }[];
};

export const useConnectedInstances = (
    application: string,
    environment?: string,
    options: SWRConfiguration = {},
) => {
    const encodedApplication = encodeURIComponent(application);
    const path = formatApiPath(
        `api/admin/metrics/instances/${encodedApplication}/environment/${environment}`,
    );
    const { data, error } = useConditionalSWR<ConnectedInstancesSchema>(
        Boolean(environment),
        { instances: [] },
        path,
        fetcher,
        options,
    );

    return {
        data: data || { instances: [] },
        error,
        loading: !error && !data,
    };
};

const fetcher = async (path: string): Promise<ConnectedInstancesSchema> => {
    const res = await fetch(path).then(
        handleErrorResponses('Connected instances'),
    );
    const data = await res.json();
    return data;
};
