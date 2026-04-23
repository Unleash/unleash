import { ulid } from 'ulidx';
import { BadDataError, NotFoundError } from '../../error/index.js';
import type { Logger } from '../../logger.js';
import type {
    IAuditUser,
    IFlagResolver,
    IUnleashConfig,
} from '../../types/index.js';
import type { IScheduledActionStore } from './scheduled-action-store.js';
import type { IScheduledSequenceStore } from './scheduled-sequence-store.js';
import type {
    ScheduledAction,
    ScheduledActionWriteModel,
} from './scheduled-action.js';
import type { ScheduledSequence } from './scheduled-sequence.js';
import { mockCompile } from './mock-compiler.js';
import {
    anthropicCompile,
    isAnthropicCompilerConfigured,
    resolveMetricType,
    validAggregationsFor,
} from './anthropic-compiler.js';

interface Stores {
    scheduledSequenceStore: IScheduledSequenceStore;
    scheduledActionStore: IScheduledActionStore;
}

export type SafeguardMetricQuery = {
    metricName: string;
    timeRange: 'hour' | 'day' | 'week' | 'month';
    aggregationMode: 'rps' | 'count' | 'avg' | 'sum' | 'p95' | 'p99' | 'p50';
    labelSelectors: Record<string, string[]>;
    source?: 'internal' | 'external';
};

export type SafeguardRequest = {
    featureName: string;
    impactMetric: SafeguardMetricQuery;
    triggerCondition: { operator: '>' | '<'; threshold: number };
};

export type AvailableImpactMetric = {
    name: string;
    help?: string;
    displayName?: string;
    source: 'internal' | 'external';
    // The metric's Prometheus type, authoritative when present. When
    // undefined/'unknown' the compiler falls back to name-based inference.
    metricType?: 'counter' | 'gauge' | 'histogram' | 'unknown';
};

export interface IAvailableImpactMetricsProvider {
    getAvailableMetrics(): Promise<AvailableImpactMetric[]>;
}

export type AvailableMcpTool = {
    name: string;
    description?: string;
    inputSchema?: Record<string, unknown>;
};

export type AvailableMcpServer = {
    name: string;
    description?: string;
    tools: AvailableMcpTool[];
};

export interface IMcpServerCatalogProvider {
    listServers(): Promise<AvailableMcpServer[]>;
}

export interface ISequenceCommitParticipant {
    onCommit(
        sequence: ScheduledSequence,
        safeguards: SafeguardRequest[],
        auditUser: IAuditUser,
    ): Promise<void>;
}

const NOOP_METRICS_PROVIDER: IAvailableImpactMetricsProvider = {
    getAvailableMetrics: async () => [],
};

const NOOP_COMMIT_PARTICIPANT: ISequenceCommitParticipant = {
    onCommit: async () => {},
};

const NOOP_MCP_CATALOG: IMcpServerCatalogProvider = {
    listServers: async () => [],
};

export type CreateSequenceInput = {
    project: string;
    environment: string;
    prompt?: string | null;
    model?: string | null;
    agentVersion?: string | null;
    actions: CreateActionInput[];
    safeguards?: SafeguardRequest[];
};

export type CreateActionInput = Omit<
    ScheduledActionWriteModel,
    'id' | 'sequenceId' | 'sortOrder'
> & {
    sortOrder?: number;
};

export type CreatedSequence = {
    sequence: ScheduledSequence;
    actions: ScheduledAction[];
};

export type CompileSequenceInput = {
    project: string;
    environment: string;
    prompt: string;
    features: string[];
};

export type CompiledSequencePreview = {
    project: string;
    environment: string;
    prompt: string;
    model: string;
    agentVersion: string;
    rationale: string;
    actions: CreateActionInput[];
    safeguards: SafeguardRequest[];
    clarification?: string;
};

export type ReleaseAgentServiceOptions = {
    availableImpactMetricsProvider?: IAvailableImpactMetricsProvider;
    commitParticipant?: ISequenceCommitParticipant;
    mcpServerCatalog?: IMcpServerCatalogProvider;
};

export class ReleaseAgentService {
    private readonly logger: Logger;
    private readonly sequenceStore: IScheduledSequenceStore;
    private readonly actionStore: IScheduledActionStore;
    private readonly flagResolver: IFlagResolver;
    private metricsProvider: IAvailableImpactMetricsProvider;
    private commitParticipant: ISequenceCommitParticipant;
    private mcpCatalog: IMcpServerCatalogProvider;

    constructor(
        stores: Stores,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        options: ReleaseAgentServiceOptions = {},
    ) {
        this.logger = getLogger(
            'features/release-agent/release-agent-service.ts',
        );
        this.sequenceStore = stores.scheduledSequenceStore;
        this.actionStore = stores.scheduledActionStore;
        this.flagResolver = flagResolver;
        this.metricsProvider =
            options.availableImpactMetricsProvider ?? NOOP_METRICS_PROVIDER;
        this.commitParticipant =
            options.commitParticipant ?? NOOP_COMMIT_PARTICIPANT;
        this.mcpCatalog = options.mcpServerCatalog ?? NOOP_MCP_CATALOG;
    }

    setAvailableImpactMetricsProvider(
        provider: IAvailableImpactMetricsProvider,
    ) {
        this.metricsProvider = provider;
    }

    setCommitParticipant(participant: ISequenceCommitParticipant) {
        this.commitParticipant = participant;
    }

    setMcpServerCatalog(catalog: IMcpServerCatalogProvider) {
        this.mcpCatalog = catalog;
    }

    private assertEnabled() {
        if (!this.flagResolver.isEnabled('releaseAgent')) {
            throw new NotFoundError('Release agent is not enabled');
        }
    }

    private validateActions(
        actions: CreateActionInput[],
        safeguards: SafeguardRequest[] = [],
    ) {
        if (!actions || actions.length === 0) {
            throw new BadDataError(
                'A sequence must contain at least one action',
            );
        }
        for (const action of actions) {
            if (!action.featureName) {
                throw new BadDataError(
                    'Each action must target a feature (featureName)',
                );
            }
            if (!(action.fireAt instanceof Date)) {
                throw new BadDataError(
                    `Action for feature ${action.featureName} has an invalid fireAt`,
                );
            }
            if (!action.actionType) {
                throw new BadDataError(
                    `Action for feature ${action.featureName} is missing actionType`,
                );
            }
            this.validatePayload(action);
        }
        this.validateEnablementOrdering(actions);
        this.validateSafeguards(actions, safeguards);
    }

    private validateSafeguards(
        actions: CreateActionInput[],
        safeguards: SafeguardRequest[],
    ) {
        if (safeguards.length === 0) return;
        const featureNames = new Set(actions.map((a) => a.featureName));
        for (const safeguard of safeguards) {
            if (!safeguard.featureName) {
                throw new BadDataError(
                    'Every safeguard must target a feature (featureName)',
                );
            }
            if (!featureNames.has(safeguard.featureName)) {
                throw new BadDataError(
                    `Safeguard targets feature "${safeguard.featureName}" which has no actions in this sequence`,
                );
            }
            const metric = safeguard.impactMetric;
            if (
                !metric ||
                typeof metric.metricName !== 'string' ||
                metric.metricName.trim() === ''
            ) {
                throw new BadDataError(
                    `Safeguard for feature "${safeguard.featureName}" must include a non-empty impactMetric.metricName`,
                );
            }
            const validAggregations = [
                'rps',
                'count',
                'avg',
                'sum',
                'p95',
                'p99',
                'p50',
            ];
            if (
                typeof metric.aggregationMode !== 'string' ||
                !validAggregations.includes(metric.aggregationMode)
            ) {
                throw new BadDataError(
                    `Safeguard for feature "${safeguard.featureName}" must set impactMetric.aggregationMode to one of: ${validAggregations.join(', ')}`,
                );
            }
            const validTimeRanges = ['hour', 'day', 'week', 'month'];
            if (
                typeof metric.timeRange !== 'string' ||
                !validTimeRanges.includes(metric.timeRange)
            ) {
                throw new BadDataError(
                    `Safeguard for feature "${safeguard.featureName}" must set impactMetric.timeRange to one of: ${validTimeRanges.join(', ')}`,
                );
            }
            const cond = safeguard.triggerCondition;
            if (!cond || (cond.operator !== '>' && cond.operator !== '<')) {
                throw new BadDataError(
                    `Safeguard for feature "${safeguard.featureName}" must set triggerCondition.operator to ">" or "<"`,
                );
            }
            if (
                typeof cond.threshold !== 'number' ||
                !Number.isFinite(cond.threshold)
            ) {
                throw new BadDataError(
                    `Safeguard for feature "${safeguard.featureName}" must set triggerCondition.threshold to a finite number`,
                );
            }
        }
    }

    private validateEnablementOrdering(actions: CreateActionInput[]) {
        const byFeature = new Map<
            string,
            { firstCreate?: Date; firstEnable?: Date }
        >();
        for (const action of actions) {
            const entry = byFeature.get(action.featureName) ?? {};
            if (action.actionType === 'strategy.create') {
                if (!entry.firstCreate || action.fireAt < entry.firstCreate) {
                    entry.firstCreate = action.fireAt;
                }
            } else if (
                action.actionType === 'feature_environment.setEnabled' &&
                (action.payload as { enabled?: boolean })?.enabled === true
            ) {
                if (!entry.firstEnable || action.fireAt < entry.firstEnable) {
                    entry.firstEnable = action.fireAt;
                }
            }
            byFeature.set(action.featureName, entry);
        }
        for (const [feature, { firstCreate, firstEnable }] of byFeature) {
            if (firstCreate && firstEnable && firstEnable <= firstCreate) {
                throw new BadDataError(
                    `For feature ${feature}, the first strategy.create (fireAt ${firstCreate.toISOString()}) must occur strictly before feature_environment.setEnabled(true) (fireAt ${firstEnable.toISOString()}). Enabling an environment with no strategies auto-creates a 100% rollout.`,
                );
            }
        }
    }

    private validatePayload(action: CreateActionInput) {
        const payload = action.payload as Record<string, unknown> | undefined;
        const label = `Action for feature ${action.featureName} (${action.actionType})`;
        if (!payload || typeof payload !== 'object') {
            throw new BadDataError(`${label} is missing a payload object`);
        }
        switch (action.actionType) {
            case 'strategy.create':
                if (typeof payload.strategyName !== 'string') {
                    throw new BadDataError(
                        `${label} must include a string payload.strategyName`,
                    );
                }
                return;
            case 'strategy.update': {
                this.validateStrategyRef(label, payload);
                const patch = payload.patch as Record<string, unknown>;
                if (!patch || typeof patch !== 'object') {
                    throw new BadDataError(
                        `${label} must include a payload.patch object`,
                    );
                }
                if ('strategyName' in patch) {
                    throw new BadDataError(
                        `${label} must not change strategyName; create a new strategy instead`,
                    );
                }
                return;
            }
            case 'strategy.delete':
                this.validateStrategyRef(label, payload);
                return;
            case 'feature_environment.setEnabled':
                if (typeof payload.enabled !== 'boolean') {
                    throw new BadDataError(
                        `${label} must include a boolean payload.enabled`,
                    );
                }
                return;
            case 'mcp.invoke': {
                if (
                    typeof payload.server !== 'string' ||
                    payload.server.trim() === ''
                ) {
                    throw new BadDataError(
                        `${label} must include a non-empty payload.server`,
                    );
                }
                if (
                    typeof payload.tool !== 'string' ||
                    payload.tool.trim() === ''
                ) {
                    throw new BadDataError(
                        `${label} must include a non-empty payload.tool`,
                    );
                }
                if (
                    !payload.arguments ||
                    typeof payload.arguments !== 'object'
                ) {
                    throw new BadDataError(
                        `${label} must include a payload.arguments object`,
                    );
                }
                return;
            }
        }
    }

    private validateStrategyRef(
        label: string,
        payload: Record<string, unknown>,
    ) {
        const ref = payload.strategyRef as Record<string, unknown> | undefined;
        if (!ref || typeof ref !== 'object') {
            throw new BadDataError(
                `${label} must include a payload.strategyRef`,
            );
        }
        if (ref.type !== 'owned' && ref.type !== 'id') {
            throw new BadDataError(
                `${label} strategyRef.type must be "owned" or "id"`,
            );
        }
        if (ref.type === 'owned' && typeof ref.sortOrder !== 'number') {
            throw new BadDataError(
                `${label} strategyRef of type "owned" requires a numeric sortOrder`,
            );
        }
        if (ref.type === 'id' && typeof ref.id !== 'string') {
            throw new BadDataError(
                `${label} strategyRef of type "id" requires a string id`,
            );
        }
    }

    async createSequence(
        input: CreateSequenceInput,
        auditUser: IAuditUser,
    ): Promise<CreatedSequence> {
        this.assertEnabled();
        const safeguards = input.safeguards ?? [];
        this.validateActions(input.actions, safeguards);

        const sequenceId = ulid();
        const sequence = await this.sequenceStore.insert({
            id: sequenceId,
            project: input.project,
            environment: input.environment,
            createdByUserId: auditUser.id,
            prompt: input.prompt ?? null,
            model: input.model ?? null,
            agentVersion: input.agentVersion ?? null,
        });

        const actionWrites: ScheduledActionWriteModel[] = input.actions.map(
            (action, index) =>
                ({
                    ...action,
                    id: ulid(),
                    sequenceId,
                    sortOrder: action.sortOrder ?? index,
                }) as ScheduledActionWriteModel,
        );

        const actions = await this.actionStore.bulkInsert(actionWrites);

        this.logger.info(
            `Created scheduled sequence ${sequenceId} with ${actions.length} actions`,
        );

        if (safeguards.length > 0) {
            try {
                await this.commitParticipant.onCommit(
                    sequence,
                    safeguards,
                    auditUser,
                );
            } catch (err) {
                this.logger.error(
                    `Sequence ${sequenceId} committed but safeguard participant failed; safeguards may not be attached`,
                    err,
                );
            }
        }

        return { sequence, actions };
    }

    async getSequence(id: string): Promise<CreatedSequence> {
        this.assertEnabled();
        const sequence = await this.sequenceStore.get(id);
        const actions = await this.actionStore.getBySequenceId(id);
        return { sequence, actions };
    }

    async listSequences(
        project: string,
        environment: string,
    ): Promise<CreatedSequence[]> {
        this.assertEnabled();
        const sequences = await this.sequenceStore.getByProjectAndEnvironment(
            project,
            environment,
        );
        return Promise.all(
            sequences.map(async (sequence) => ({
                sequence,
                actions: await this.actionStore.getBySequenceId(sequence.id),
            })),
        );
    }

    async compileSequence(
        input: CompileSequenceInput,
    ): Promise<CompiledSequencePreview> {
        this.assertEnabled();
        if (!input.prompt || input.prompt.trim().length === 0) {
            throw new BadDataError('Prompt is required');
        }
        if (!input.features || input.features.length === 0) {
            throw new BadDataError(
                'Select at least one feature to compile a sequence for',
            );
        }

        const [availableMetrics, availableMcpServers] = await Promise.all([
            this.metricsProvider.getAvailableMetrics(),
            this.mcpCatalog.listServers(),
        ]);

        const compilerInput = {
            project: input.project,
            environment: input.environment,
            prompt: input.prompt,
            features: input.features,
            availableMetrics,
            availableMcpServers,
        };

        const compiled = isAnthropicCompilerConfigured()
            ? await anthropicCompile(compilerInput, { logger: this.logger })
            : mockCompile(compilerInput);

        if (!isAnthropicCompilerConfigured()) {
            this.logger.info(
                'ANTHROPIC_API_KEY not set; falling back to mock compiler',
            );
        }

        if (compiled.clarificationNeeded) {
            return {
                project: input.project,
                environment: input.environment,
                prompt: compiled.prompt,
                model: compiled.model,
                agentVersion: compiled.agentVersion,
                rationale: compiled.rationale,
                actions: [],
                safeguards: [],
                clarification: compiled.clarificationNeeded,
            };
        }

        if (compiled.safeguards.length > 0 && availableMetrics.length === 0) {
            return {
                project: input.project,
                environment: input.environment,
                prompt: compiled.prompt,
                model: compiled.model,
                agentVersion: compiled.agentVersion,
                rationale: compiled.rationale,
                actions: [],
                safeguards: [],
                clarification:
                    'You asked for a safeguard, but no impact metrics are configured in this instance. Create an impact metric first, then re-prompt.',
            };
        }

        if (compiled.actions.length === 0) {
            return {
                project: input.project,
                environment: input.environment,
                prompt: compiled.prompt,
                model: compiled.model,
                agentVersion: compiled.agentVersion,
                rationale: compiled.rationale,
                actions: [],
                safeguards: [],
                clarification:
                    "The agent didn't produce any rollout steps for this prompt. Try being more specific about what should happen to which feature flag and when.",
            };
        }

        const repairedSafeguards = this.repairSafeguardAggregations(
            compiled.safeguards,
            availableMetrics,
        );
        if ('clarification' in repairedSafeguards) {
            return {
                project: input.project,
                environment: input.environment,
                prompt: compiled.prompt,
                model: compiled.model,
                agentVersion: compiled.agentVersion,
                rationale: compiled.rationale,
                actions: [],
                safeguards: [],
                clarification: repairedSafeguards.clarification,
            };
        }

        this.validateActions(compiled.actions, repairedSafeguards.safeguards);

        return {
            project: input.project,
            environment: input.environment,
            prompt: compiled.prompt,
            model: compiled.model,
            agentVersion: compiled.agentVersion,
            rationale: compiled.rationale,
            actions: compiled.actions,
            safeguards: repairedSafeguards.safeguards,
        };
    }

    private repairSafeguardAggregations(
        safeguards: SafeguardRequest[],
        availableMetrics: AvailableImpactMetric[],
    ): { safeguards: SafeguardRequest[] } | { clarification: string } {
        if (safeguards.length === 0) return { safeguards };
        const nameSet = new Set(availableMetrics.map((m) => m.name));
        const metricByName = new Map(
            availableMetrics.map((m) => [m.name, m] as const),
        );
        const repaired: SafeguardRequest[] = [];
        for (const sg of safeguards) {
            const metricName = sg.impactMetric?.metricName;
            if (!metricName || !nameSet.has(metricName)) {
                return {
                    clarification: `The agent referenced impact metric "${metricName ?? '(unnamed)'}", which isn't available. Re-prompt and name a metric the agent listed.`,
                };
            }
            const catalogEntry = metricByName.get(metricName)!;
            const resolvedType = resolveMetricType(catalogEntry, nameSet);
            const valid = validAggregationsFor(resolvedType);
            if (valid.length === 0) {
                return {
                    clarification: `Couldn't infer the metric type for "${metricName}". Tell the agent explicitly which aggregation to use (e.g., "use rps aggregation").`,
                };
            }
            const currentMode = sg.impactMetric.aggregationMode as
                | string
                | undefined;
            const modeOk =
                typeof currentMode === 'string' &&
                (valid as readonly string[]).includes(currentMode);
            if (modeOk) {
                repaired.push(sg);
            } else {
                this.logger.warn(
                    `Agent returned invalid aggregationMode "${currentMode ?? ''}" for ${metricName}; substituting "${valid[0]}"`,
                );
                repaired.push({
                    ...sg,
                    impactMetric: {
                        ...sg.impactMetric,
                        aggregationMode: valid[0],
                    },
                });
            }
        }
        return { safeguards: repaired };
    }

    async cancelSequence(id: string): Promise<ScheduledSequence> {
        this.assertEnabled();
        const sequence = await this.sequenceStore.get(id);
        if (sequence.status !== 'active') {
            throw new BadDataError(
                `Cannot cancel sequence ${id} with status ${sequence.status}`,
            );
        }
        await this.actionStore.cancelPendingForSequence(id);
        return this.sequenceStore.updateStatus(id, 'cancelled');
    }
}
