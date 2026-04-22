import type {
    AvailableImpactMetric,
    AvailableMcpServer,
    CreateActionInput,
    SafeguardRequest,
} from './release-agent-service.js';

export type MockCompileInput = {
    project: string;
    environment: string;
    prompt: string;
    features: string[];
    now?: Date;
    availableMetrics?: AvailableImpactMetric[];
    availableMcpServers?: AvailableMcpServer[];
};

export type MockCompileOutput = {
    prompt: string;
    model: string;
    agentVersion: string;
    actions: CreateActionInput[];
    rationale: string;
    safeguards: SafeguardRequest[];
    clarificationNeeded?: string;
};

/**
 * Deterministic placeholder for the author-time LLM. Produces a plausible
 * gradual-rollout sequence for each selected feature: create a flexibleRollout
 * strategy at 10%, then step it to 50%, then 100% over five minutes. Exists
 * so the UI and commit flow can be built without an LLM dependency; will be
 * replaced by a real provider call in a follow-up iteration.
 */
export const mockCompile = (input: MockCompileInput): MockCompileOutput => {
    const now = input.now ?? new Date();
    const features = input.features.length > 0 ? input.features : [];
    const actions: CreateActionInput[] = [];

    features.forEach((featureName) => {
        const rollouts = [
            { offsetMinutes: 1, percentage: '10' },
            { offsetMinutes: 3, percentage: '50' },
            { offsetMinutes: 5, percentage: '100' },
        ];

        rollouts.forEach((step, index) => {
            const fireAt = new Date(
                now.getTime() + step.offsetMinutes * 60_000,
            );
            if (index === 0) {
                actions.push({
                    featureName,
                    fireAt,
                    actionType: 'strategy.create',
                    payload: {
                        strategyName: 'flexibleRollout',
                        parameters: {
                            rollout: step.percentage,
                            stickiness: 'default',
                            groupId: featureName,
                        },
                    },
                } as CreateActionInput);
            } else {
                actions.push({
                    featureName,
                    fireAt,
                    actionType: 'strategy.update',
                    payload: {
                        strategyRef: { type: 'owned', sortOrder: 0 },
                        patch: {
                            parameters: {
                                rollout: step.percentage,
                                stickiness: 'default',
                                groupId: featureName,
                            },
                        },
                    },
                } as CreateActionInput);
            }
        });
    });

    return {
        prompt: input.prompt,
        model: 'mock-compiler',
        agentVersion: '0.1.0',
        actions,
        safeguards: [],
        rationale:
            features.length === 0
                ? 'No features selected; returning an empty sequence.'
                : `Canary rollout: 10% at T+1m, 50% at T+3m, 100% at T+5m for ${features.join(', ')}.`,
    };
};
