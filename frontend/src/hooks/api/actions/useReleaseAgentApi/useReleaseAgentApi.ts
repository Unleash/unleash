import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import type { ScheduledSequence } from 'hooks/api/getters/useReleaseAgent/useReleaseAgentSequences';

export type CompileRequestBody = {
    project: string;
    environment: string;
    prompt: string;
    features: string[];
};

export type PreviewAction = {
    featureName: string;
    fireAt: string;
    actionType:
        | 'strategy.create'
        | 'strategy.update'
        | 'strategy.delete'
        | 'feature_environment.setEnabled';
    payload: Record<string, unknown>;
    sortOrder?: number;
};

export type CompiledPreview = {
    project: string;
    environment: string;
    prompt: string;
    model: string;
    agentVersion: string;
    rationale: string;
    actions: PreviewAction[];
};

export type CommitRequestBody = {
    project: string;
    environment: string;
    prompt?: string | null;
    model?: string | null;
    agentVersion?: string | null;
    actions: PreviewAction[];
};

const BASE = 'api/admin/release-agent';

export const useReleaseAgentApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const compileSequence = useCallback(
        async (body: CompileRequestBody): Promise<CompiledPreview> => {
            const req = createRequest(
                `${BASE}/compile`,
                {
                    method: 'POST',
                    body: JSON.stringify(body),
                },
                'compileReleaseAgentSequence',
            );
            const res = await makeRequest(req.caller, req.id);
            return (await res.json()) as CompiledPreview;
        },
        [createRequest, makeRequest],
    );

    const commitSequence = useCallback(
        async (body: CommitRequestBody): Promise<ScheduledSequence> => {
            const req = createRequest(
                `${BASE}/sequences`,
                {
                    method: 'POST',
                    body: JSON.stringify(body),
                },
                'createScheduledSequence',
            );
            const res = await makeRequest(req.caller, req.id);
            return (await res.json()) as ScheduledSequence;
        },
        [createRequest, makeRequest],
    );

    const cancelSequence = useCallback(
        async (id: string): Promise<void> => {
            const req = createRequest(
                `${BASE}/sequences/${id}`,
                {
                    method: 'DELETE',
                },
                'cancelScheduledSequence',
            );
            await makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest],
    );

    return {
        compileSequence,
        commitSequence,
        cancelSequence,
        errors,
        loading,
    };
};
