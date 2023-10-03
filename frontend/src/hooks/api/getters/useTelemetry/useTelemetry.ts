import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export interface ITelemetrySettings {
    versionInfoCollectionEnabled: boolean;
    featureInfoCollectionEnabled: boolean;
}

export interface ITelemetrySettingsResponse {
    settings: ITelemetrySettings;
    refetchGroup: () => void;
    loading: boolean;
    error?: Error;
}

export const useTelemetry = (): ITelemetrySettingsResponse => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/telemetry/settings`),
        fetcher
    );

    return useMemo(
        () => ({
            settings: data,
            loading: !error && !data,
            refetchGroup: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Telemetry Settings'))
        .then(res => res.json());
};
