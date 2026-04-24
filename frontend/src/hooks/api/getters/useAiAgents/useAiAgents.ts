import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

export type AiAgentEvent = {
    id: number;
    title: string | null;
    description: string;
    timestamp: string;
};

export type AiAgent = {
    id: number;
    externalId: string;
    displayName: string | null;
    type: string | null;
    lastSeenAt: string;
    isLive: boolean;
    recentEvents: AiAgentEvent[];
};

type AiAgentsResponse = { agents: AiAgent[] };

export type UseAiAgentsOutput = {
    agents: AiAgent[];
    loading: boolean;
    error?: Error;
    refetch: () => void;
};

const fetcher = (path: string): Promise<AiAgentsResponse> =>
    fetch(path)
        .then(handleErrorResponses('AI agents'))
        .then((res) => res.json());

export type UseAiAgentsOptions = {
    type?: string;
};

export const useAiAgents = (
    options: UseAiAgentsOptions = {},
): UseAiAgentsOutput => {
    const path = options.type
        ? formatApiPath(
              `api/admin/ai-agents?type=${encodeURIComponent(options.type)}`,
          )
        : formatApiPath('api/admin/ai-agents');

    const { data, error, mutate } = useSWR<AiAgentsResponse>(path, fetcher, {
        refreshInterval: 2_000,
    });

    return useMemo(
        () => ({
            agents: data?.agents ?? [],
            loading: !error && !data,
            error,
            refetch: () => mutate(),
        }),
        [data, error, mutate],
    );
};
