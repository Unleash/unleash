import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    ChangeRequestType,
    IChangeRequestAddStrategy,
    IChangeRequestUpdateStrategy,
    IFeatureChange,
} from 'component/changeRequest/changeRequest.types';
import { useMemo } from 'react';
import { constraintId } from 'constants/constraintId.js';
import { v4 as uuidv4 } from 'uuid';

const isAddStrategyChange = (
    change: IFeatureChange,
): change is IChangeRequestAddStrategy => change.action === 'addStrategy';
const isUpdateStrategyChange = (
    change: IFeatureChange,
): change is IChangeRequestUpdateStrategy => change.action === 'updateStrategy';

export const useChangeRequest = (projectId: string, id: string) => {
    const { data, error, mutate } = useSWR<ChangeRequestType>(
        formatApiPath(`api/admin/projects/${projectId}/change-requests/${id}`),
        fetcher,
        { refreshInterval: 15000 },
    );

    const dataWithConstraintIds: ChangeRequestType | undefined = useMemo(() => {
        if (!data) {
            return data;
        }

        const features = data.features.map((feature) => {
            const changes: IFeatureChange[] = feature.changes.map((change) => {
                if (
                    isAddStrategyChange(change) ||
                    isUpdateStrategyChange(change)
                ) {
                    const { constraints, ...rest } = change.payload;
                    return {
                        ...change,
                        payload: {
                            ...rest,
                            constraints: constraints.map((constraint) => ({
                                ...constraint,
                                [constraintId]: uuidv4(),
                            })),
                        },
                    } as IFeatureChange;
                }
                return change;
            });

            return {
                ...feature,
                changes,
            };
        });

        const value: ChangeRequestType = {
            ...data,
            features,
        };
        return value;
    }, [data]);

    return {
        data: dataWithConstraintIds,
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
