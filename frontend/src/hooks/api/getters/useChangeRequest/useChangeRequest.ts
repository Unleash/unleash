import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    ChangeRequestType,
    IChangeRequestFeature,
    IFeatureChange,
} from 'component/changeRequest/changeRequest.types';
import { useMemo } from 'react';
import { addConstraintIdsToFeatureChange } from 'utils/addConstraintIdsToFeatureChange.js';

export const useChangeRequest = (projectId: string, id: string) => {
    const { data, error, mutate } = useSWR<ChangeRequestType>(
        formatApiPath(`api/admin/projects/${projectId}/change-requests/${id}`),
        fetcher,
        { refreshInterval: 15000 },
    );

    const { features, ...dataProps } = data || {};
    const featuresWithConstraintIds: IChangeRequestFeature[] | undefined =
        useMemo(() => {
            return (
                features?.map((feature) => {
                    const changes: IFeatureChange[] = feature.changes.map(
                        addConstraintIdsToFeatureChange,
                    );

                    return {
                        ...feature,
                        changes,
                    };
                }) ?? []
            );
        }, [JSON.stringify(features)]);

    const mappedData = data
        ? {
              ...dataProps,
              features: featuresWithConstraintIds,
          }
        : data;

    return {
        data: mappedData,
        loading: !error && !data,
        refetchChangeRequest: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then((res) => res.json());
};
