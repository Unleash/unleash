import { useCallback } from 'react';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

export type ScheduledSequenceStatus =
    | 'active'
    | 'cancelled'
    | 'completed'
    | 'conflicted';

export type ScheduledActionStatus =
    | 'pending'
    | 'executed'
    | 'failed'
    | 'skipped';

export type ScheduledAction = {
    id: string;
    sequenceId: string;
    featureName: string;
    fireAt: string;
    actionType:
        | 'strategy.create'
        | 'strategy.update'
        | 'strategy.delete'
        | 'feature_environment.setEnabled'
        | 'mcp.invoke';
    payload: Record<string, unknown>;
    ownedStrategyId?: string | null;
    status: ScheduledActionStatus;
    executedAt?: string | null;
    error?: string | null;
    sortOrder: number;
};

export type ScheduledSequence = {
    id: string;
    project: string;
    environment: string;
    createdByUserId?: number | null;
    createdAt: string;
    prompt?: string | null;
    model?: string | null;
    agentVersion?: string | null;
    status: ScheduledSequenceStatus;
    actions?: ScheduledAction[];
};

type ListResponse = { sequences: ScheduledSequence[] };

export const useReleaseAgentSequences = (
    project?: string,
    environment?: string,
) => {
    const enabled = Boolean(project && environment);
    const path = enabled
        ? formatApiPath(
              `api/admin/release-agent/sequences?project=${encodeURIComponent(project!)}&environment=${encodeURIComponent(environment!)}`,
          )
        : null;

    const { data, error, mutate } = useSWR<ListResponse>(path, (p: string) =>
        fetch(p)
            .then(handleErrorResponses('Release agent sequences'))
            .then((res) => res.json()),
    );

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        sequences: data?.sequences ?? [],
        loading: enabled && !error && !data,
        error,
        refetch,
    };
};
