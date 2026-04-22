import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import { ADMIN, NONE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type { ReleaseAgentService } from './release-agent-service.js';
import type { CreateScheduledSequenceSchema } from '../../openapi/spec/create-scheduled-sequence-schema.js';
import type { ScheduledSequenceSchema } from '../../openapi/spec/scheduled-sequence-schema.js';
import type { ScheduledSequencesSchema } from '../../openapi/spec/scheduled-sequences-schema.js';
import type { CompileSequenceRequestSchema } from '../../openapi/spec/compile-sequence-request-schema.js';
import type { CompiledSequencePreviewSchema } from '../../openapi/spec/compiled-sequence-preview-schema.js';
import type {
    CreateActionInput,
    CreateSequenceInput,
} from './release-agent-service.js';
import type { ScheduledAction } from './scheduled-action.js';
import type { ScheduledSequence } from './scheduled-sequence.js';
import NotFoundError from '../../error/notfound-error.js';
import type { IFlagResolver } from '../../types/index.js';

interface Services {
    releaseAgentService: ReleaseAgentService;
    openApiService: OpenApiService;
}

const SEQUENCES_PATH = '/sequences';
const SEQUENCE_PATH = '/sequences/:id';
const COMPILE_PATH = '/compile';

const toSequenceResponse = (
    sequence: ScheduledSequence,
    actions?: ScheduledAction[],
): ScheduledSequenceSchema => ({
    id: sequence.id,
    project: sequence.project,
    environment: sequence.environment,
    createdByUserId: sequence.createdByUserId ?? undefined,
    createdAt: sequence.createdAt.toISOString(),
    prompt: sequence.prompt ?? undefined,
    model: sequence.model ?? undefined,
    agentVersion: sequence.agentVersion ?? undefined,
    status: sequence.status,
    actions: actions?.map((action) => ({
        id: action.id,
        sequenceId: action.sequenceId,
        featureName: action.featureName,
        fireAt: action.fireAt.toISOString(),
        actionType: action.actionType,
        payload: action.payload as Record<string, unknown>,
        ownedStrategyId: action.ownedStrategyId ?? undefined,
        status: action.status,
        executedAt: action.executedAt
            ? action.executedAt.toISOString()
            : undefined,
        error: action.error ?? undefined,
        sortOrder: action.sortOrder,
    })),
});

export default class ReleaseAgentController extends Controller {
    private releaseAgentService: ReleaseAgentService;
    private openApiService: OpenApiService;
    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        { releaseAgentService, openApiService }: Services,
    ) {
        super(config);
        this.releaseAgentService = releaseAgentService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'post',
            path: SEQUENCES_PATH,
            handler: this.createSequence,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Release Templates'],
                    operationId: 'createScheduledSequence',
                    summary: 'Create a scheduled sequence',
                    description:
                        'Create a new scheduled sequence with a set of actions that will be executed at their scheduled times. Experimental. Behind the releaseAgent feature flag.',
                    requestBody: createRequestSchema(
                        'createScheduledSequenceSchema',
                    ),
                    responses: {
                        201: createResponseSchema('scheduledSequenceSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: SEQUENCES_PATH,
            handler: this.listSequences,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Release Templates'],
                    operationId: 'listScheduledSequences',
                    summary:
                        'List scheduled sequences for a project/environment',
                    description:
                        'Returns sequences scoped by the required `project` and `environment` query parameters. Experimental.',
                    responses: {
                        200: createResponseSchema('scheduledSequencesSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: SEQUENCE_PATH,
            handler: this.getSequence,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Release Templates'],
                    operationId: 'getScheduledSequence',
                    summary: 'Get a scheduled sequence by id',
                    description:
                        'Returns the sequence plus its ordered list of actions. Experimental.',
                    responses: {
                        200: createResponseSchema('scheduledSequenceSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: SEQUENCE_PATH,
            handler: this.cancelSequence,
            acceptAnyContentType: true,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Release Templates'],
                    operationId: 'cancelScheduledSequence',
                    summary: 'Cancel a scheduled sequence',
                    description:
                        'Marks the sequence as cancelled and skips any remaining pending actions. Already-executed actions are untouched. Experimental.',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: COMPILE_PATH,
            handler: this.compileSequence,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Release Templates'],
                    operationId: 'compileReleaseAgentSequence',
                    summary:
                        'Compile a natural-language prompt into a Scheduled Sequence preview',
                    description:
                        'Returns a preview Scheduled Sequence — no persistence. Commit the preview by POSTing its actions to /sequences. Currently returns a deterministic mock; the real LLM provider lands in a follow-up iteration. Experimental.',
                    requestBody: createRequestSchema(
                        'compileSequenceRequestSchema',
                    ),
                    responses: {
                        200: createResponseSchema(
                            'compiledSequencePreviewSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });
    }

    private assertEnabled() {
        if (!this.flagResolver.isEnabled('releaseAgent')) {
            throw new NotFoundError('Release agent is not enabled');
        }
    }

    async createSequence(
        req: IAuthRequest<unknown, unknown, CreateScheduledSequenceSchema>,
        res: Response<ScheduledSequenceSchema>,
    ): Promise<void> {
        this.assertEnabled();

        const input: CreateSequenceInput = {
            project: req.body.project,
            environment: req.body.environment,
            prompt: req.body.prompt ?? null,
            model: req.body.model ?? null,
            agentVersion: req.body.agentVersion ?? null,
            actions: req.body.actions.map(
                (action): CreateActionInput =>
                    ({
                        featureName: action.featureName,
                        fireAt: new Date(action.fireAt),
                        actionType: action.actionType,
                        payload: action.payload,
                        sortOrder: action.sortOrder,
                    }) as CreateActionInput,
            ),
            safeguards: req.body.safeguards as
                | CreateSequenceInput['safeguards']
                | undefined,
        };

        const { sequence, actions } =
            await this.releaseAgentService.createSequence(input, req.audit);

        res.status(201).json(toSequenceResponse(sequence, actions));
    }

    async listSequences(
        req: IAuthRequest<
            unknown,
            unknown,
            unknown,
            { project?: string; environment?: string }
        >,
        res: Response<ScheduledSequencesSchema>,
    ): Promise<void> {
        this.assertEnabled();
        const { project, environment } = req.query;
        if (!project || !environment) {
            res.status(400).json({
                sequences: [],
            });
            return;
        }
        const sequences = await this.releaseAgentService.listSequences(
            project,
            environment,
        );
        res.json({
            sequences: sequences.map(({ sequence, actions }) =>
                toSequenceResponse(sequence, actions),
            ),
        });
    }

    async getSequence(
        req: IAuthRequest<{ id: string }>,
        res: Response<ScheduledSequenceSchema>,
    ): Promise<void> {
        this.assertEnabled();
        const { sequence, actions } =
            await this.releaseAgentService.getSequence(req.params.id);
        res.json(toSequenceResponse(sequence, actions));
    }

    async cancelSequence(
        req: IAuthRequest<{ id: string }>,
        res: Response,
    ): Promise<void> {
        this.assertEnabled();
        await this.releaseAgentService.cancelSequence(req.params.id);
        res.status(204).end();
    }

    async compileSequence(
        req: IAuthRequest<unknown, unknown, CompileSequenceRequestSchema>,
        res: Response<CompiledSequencePreviewSchema>,
    ): Promise<void> {
        this.assertEnabled();
        const preview = await this.releaseAgentService.compileSequence({
            project: req.body.project,
            environment: req.body.environment,
            prompt: req.body.prompt,
            features: req.body.features,
        });
        res.json({
            project: preview.project,
            environment: preview.environment,
            prompt: preview.prompt,
            model: preview.model,
            agentVersion: preview.agentVersion,
            rationale: preview.rationale,
            actions: preview.actions.map((action) => ({
                featureName: action.featureName,
                fireAt:
                    action.fireAt instanceof Date
                        ? action.fireAt.toISOString()
                        : (action.fireAt as unknown as string),
                actionType: action.actionType,
                payload: action.payload as Record<string, unknown>,
                sortOrder: action.sortOrder,
            })),
            safeguards: preview.safeguards,
            clarification: preview.clarification,
        });
    }
}
