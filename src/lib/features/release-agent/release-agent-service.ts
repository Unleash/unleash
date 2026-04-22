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
} from './anthropic-compiler.js';

interface Stores {
    scheduledSequenceStore: IScheduledSequenceStore;
    scheduledActionStore: IScheduledActionStore;
}

export type CreateSequenceInput = {
    project: string;
    environment: string;
    prompt?: string | null;
    model?: string | null;
    agentVersion?: string | null;
    actions: CreateActionInput[];
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
};

export class ReleaseAgentService {
    private readonly logger: Logger;
    private readonly sequenceStore: IScheduledSequenceStore;
    private readonly actionStore: IScheduledActionStore;
    private readonly flagResolver: IFlagResolver;

    constructor(
        stores: Stores,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger(
            'features/release-agent/release-agent-service.ts',
        );
        this.sequenceStore = stores.scheduledSequenceStore;
        this.actionStore = stores.scheduledActionStore;
        this.flagResolver = flagResolver;
    }

    private assertEnabled() {
        if (!this.flagResolver.isEnabled('releaseAgent')) {
            throw new NotFoundError('Release agent is not enabled');
        }
    }

    private validateActions(actions: CreateActionInput[]) {
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
        this.validateActions(input.actions);

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
    ): Promise<ScheduledSequence[]> {
        this.assertEnabled();
        return this.sequenceStore.getByProjectAndEnvironment(
            project,
            environment,
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

        const compilerInput = {
            project: input.project,
            environment: input.environment,
            prompt: input.prompt,
            features: input.features,
        };

        const compiled = isAnthropicCompilerConfigured()
            ? await anthropicCompile(compilerInput, { logger: this.logger })
            : mockCompile(compilerInput);

        if (!isAnthropicCompilerConfigured()) {
            this.logger.info(
                'ANTHROPIC_API_KEY not set; falling back to mock compiler',
            );
        }

        this.validateActions(compiled.actions);

        return {
            project: input.project,
            environment: input.environment,
            prompt: compiled.prompt,
            model: compiled.model,
            agentVersion: compiled.agentVersion,
            rationale: compiled.rationale,
            actions: compiled.actions,
        };
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
