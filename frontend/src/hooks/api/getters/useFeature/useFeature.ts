import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';
import { emptyFeature } from './emptyFeature.ts';
import handleErrorResponses from '../httpErrorResponseHandler.ts';
import { formatApiPath } from 'utils/formatPath';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { constraintId } from 'constants/constraintId.ts';
import { v4 as uuidv4 } from 'uuid';
import type { IFeatureStrategy } from 'interfaces/strategy.ts';

export interface IUseFeatureOutput {
    feature: IFeatureToggle;
    refetchFeature: () => void;
    loading: boolean;
    status?: number;
    error?: Error;
}

export interface IFeatureResponse {
    status: number;
    body?: IFeatureToggle;
}

export const useFeature = (
    projectId: string,
    featureId: string,
    options?: SWRConfiguration,
): IUseFeatureOutput => {
    const path = formatFeatureApiPath(projectId, featureId);

    const { data, error, mutate } = useSWR<IFeatureResponse>(
        ['useFeature', path],
        () => featureFetcher(path),
        options,
    );

    const refetchFeature = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    const feature = useMemo(enrichConstraintsWithIds(data), [
        JSON.stringify(data?.body),
    ]);

    return {
        feature,
        refetchFeature,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};

export const featureFetcher = async (
    path: string,
): Promise<IFeatureResponse> => {
    const res = await fetch(path);

    if (res.status === 404) {
        return { status: 404 };
    }

    if (!res.ok) {
        await handleErrorResponses('Feature flag data')(res);
    }

    return {
        status: res.status,
        body: await res.json(),
    };
};

export const enrichConstraintsWithIds =
    (data?: IFeatureResponse) => (): IFeatureToggle => {
        if (!data?.body) {
            return emptyFeature;
        }

        const { strategies, environments, ...rest } = data.body;

        const addConstraintIds = (strategy: IFeatureStrategy) => {
            const { constraints, ...strategyRest } = strategy;
            return {
                ...strategyRest,
                constraints: constraints?.map((constraint) => ({
                    ...constraint,
                    [constraintId]: uuidv4(),
                })),
            };
        };

        const strategiesWithConstraintIds = strategies?.map(addConstraintIds);

        const environmentsWithStrategyIds = environments?.map((environment) => {
            const { strategies, ...environmentRest } = environment;
            return {
                ...environmentRest,
                strategies: strategies?.map(addConstraintIds),
            };
        });

        return {
            ...rest,
            strategies: strategiesWithConstraintIds,
            environments: environmentsWithStrategyIds,
        };
    };

export const formatFeatureApiPath = (
    projectId: string,
    featureId: string,
): string => {
    return formatApiPath(
        `api/admin/projects/${projectId}/features/${featureId}?variantEnvironments=true`,
    );
};
