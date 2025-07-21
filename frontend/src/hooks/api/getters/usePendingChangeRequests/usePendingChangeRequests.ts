import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    ChangeRequestType,
    IFeatureChange,
} from 'component/changeRequest/changeRequest.types';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';
import { useMemo } from 'react';
import { addConstraintIdsToFeatureChange } from 'utils/addConstraintIdsToFeatureChange.js';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('ChangeRequest'))
        .then((res) => res.json());
};

export const usePendingChangeRequests = (project: string) => {
    const { data, error, mutate } = useEnterpriseSWR<ChangeRequestType[]>(
        [],
        formatApiPath(`api/admin/projects/${project}/change-requests/pending`),
        fetcher,
    );

    const mappedData: typeof data = useMemo(
        () =>
            data?.map((changeRequest) => {
                const { features, ...rest } = changeRequest || {};
                const featuresWithConstraintIds =
                    features?.map((feature) => {
                        const changes: IFeatureChange[] = feature.changes.map(
                            addConstraintIdsToFeatureChange,
                        );

                        return {
                            ...feature,
                            changes,
                        };
                    }) ?? [];

                return { ...rest, features: featuresWithConstraintIds };
            }),
        [JSON.stringify(data)],
    );

    return {
        mappedData,
        loading: !error && !data,
        refetch: mutate,
        error,
    };
};
