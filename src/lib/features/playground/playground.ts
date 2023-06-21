import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { NONE } from '../../types/permissions';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { endpointDescriptions } from '../../openapi/endpoint-descriptions';
import { getStandardResponses } from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    PlaygroundResponseSchema,
    playgroundResponseSchema,
} from '../../openapi/spec/playground-response-schema';
import { PlaygroundRequestSchema } from '../../openapi/spec/playground-request-schema';
import { PlaygroundService } from './playground-service';
import { IFlagResolver } from '../../types';
import { AdvancedPlaygroundRequestSchema } from '../../openapi/spec/advanced-playground-request-schema';
import { AdvancedPlaygroundResponseSchema } from '../../openapi/spec/advanced-playground-response-schema';
import { PlaygroundStrategySchema } from 'lib/openapi';

export const buildStrategyLink = (
    project: string,
    feature: string,
    environment: string,
    strategyId: string,
): string =>
    `/projects/${project}/features/${feature}/strategies/edit?environmentId=${environment}&strategyId=${strategyId}`;

export const addStrategyEditLink = (
    environmentId: string,
    projectId: string,
    featureName: string,
    strategy: Omit<PlaygroundStrategySchema, 'links'>,
): PlaygroundStrategySchema => {
    return {
        ...strategy,
        links: {
            edit: buildStrategyLink(
                projectId,
                featureName,
                environmentId,
                strategy.id,
            ),
        },
    };
};

export default class PlaygroundController extends Controller {
    private openApiService: OpenApiService;

    private playgroundService: PlaygroundService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            playgroundService,
        }: Pick<IUnleashServices, 'openApiService' | 'playgroundService'>,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.playgroundService = playgroundService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'post',
            path: '',
            handler: this.evaluateContext,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getPlayground',
                    tags: ['Playground'],
                    responses: {
                        ...getStandardResponses(400, 401),
                        200: createResponseSchema('playgroundResponseSchema'),
                    },
                    requestBody: createRequestSchema('playgroundRequestSchema'),
                    ...endpointDescriptions.admin.playground,
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/advanced',
            handler: this.evaluateAdvancedContext,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getAdvancedPlayground',
                    tags: ['Unstable'],
                    responses: {
                        ...getStandardResponses(400, 401),
                        200: createResponseSchema(
                            'advancedPlaygroundResponseSchema',
                        ),
                    },
                    requestBody: createRequestSchema(
                        'advancedPlaygroundRequestSchema',
                    ),
                    ...endpointDescriptions.admin.advancedPlayground,
                }),
            ],
        });
    }

    async evaluateContext(
        req: Request<any, any, PlaygroundRequestSchema>,
        res: Response<PlaygroundResponseSchema>,
    ): Promise<void> {
        const result = await this.playgroundService.evaluateQuery(
            req.body.projects || '*',
            req.body.environment,
            req.body.context,
        );
        const response: PlaygroundResponseSchema = {
            input: req.body,
            features: result.map(
                ({ name, strategies, projectId, ...rest }) => ({
                    ...rest,
                    name,
                    projectId,
                    strategies: {
                        ...strategies,
                        data: strategies.data.map((strategy) =>
                            addStrategyEditLink(
                                req.body.environment,
                                projectId,
                                name,
                                strategy,
                            ),
                        ),
                    },
                }),
            ),
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            playgroundResponseSchema.$id,
            response,
        );
    }

    async evaluateAdvancedContext(
        req: Request<any, any, AdvancedPlaygroundRequestSchema>,
        res: Response<AdvancedPlaygroundResponseSchema>,
    ): Promise<void> {
        if (this.flagResolver.isEnabled('advancedPlayground')) {
            const result = await this.playgroundService.evaluateAdvancedQuery(
                req.body.projects || '*',
                req.body.environments,
                req.body.context,
            );

            const features = result.map(({ environments, ...rest }) => {
                const transformedEnvironments = Object.entries(
                    environments,
                ).map(([envName, envFeatures]) => {
                    const transformedFeatures = envFeatures.map(
                        ({
                            name,
                            strategies,
                            environment,
                            projectId,
                            ...featRest
                        }) => ({
                            ...featRest,
                            name,
                            environment,
                            projectId,
                            strategies: {
                                ...strategies,
                                data: strategies.data.map((strategy) =>
                                    addStrategyEditLink(
                                        environment,
                                        projectId,
                                        name,
                                        strategy,
                                    ),
                                ),
                            },
                        }),
                    );
                    return [envName, transformedFeatures];
                });

                return {
                    ...rest,
                    environments: Object.fromEntries(transformedEnvironments),
                };
            });

            const response: AdvancedPlaygroundResponseSchema = {
                input: req.body,
                features: features,
            };

            res.json(response);
        } else {
            res.status(409).end();
        }
    }
}
