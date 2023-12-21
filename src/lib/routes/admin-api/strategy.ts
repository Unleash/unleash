import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import StrategyService from '../../services/strategy-service';
import { Logger } from '../../logger';
import Controller from '../controller';
import { extractUsername } from '../../util/extract-user';
import {
    DELETE_STRATEGY,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
    NONE,
} from '../../types/permissions';
import { Request, Response } from 'express';
import { IAuthRequest } from '../unleash-types';
import { OpenApiService } from '../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import {
    strategySchema,
    StrategySchema,
} from '../../openapi/spec/strategy-schema';
import {
    strategiesSchema,
    StrategiesSchema,
} from '../../openapi/spec/strategies-schema';
import { CreateStrategySchema } from '../../openapi/spec/create-strategy-schema';
import { UpdateStrategySchema } from '../../openapi/spec/update-strategy-schema';

const version = 1;

class StrategyController extends Controller {
    private logger: Logger;

    private strategyService: StrategyService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            strategyService,
            openApiService,
        }: Pick<IUnleashServices, 'strategyService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/strategy.js');
        this.strategyService = strategyService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllStrategies,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all strategies',
                    description:
                        'Retrieves all strategy types ([predefined](https://docs.getunleash.io/reference/activation-strategies "predefined strategies") and [custom strategies](https://docs.getunleash.io/reference/custom-activation-strategies)) that are defined on this Unleash instance.',
                    tags: ['Strategies'],
                    operationId: 'getAllStrategies',
                    responses: {
                        200: createResponseSchema('strategiesSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getStrategy,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a strategy definition',
                    description:
                        'Retrieves the definition of the strategy specified in the URL',

                    tags: ['Strategies'],
                    operationId: 'getStrategy',
                    responses: {
                        200: createResponseSchema('strategySchema'),
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:name',
            handler: this.removeStrategy,
            permission: DELETE_STRATEGY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    summary: 'Delete a strategy',
                    description: 'Deletes the specified strategy definition',
                    tags: ['Strategies'],
                    operationId: 'removeStrategy',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createStrategy,
            permission: CREATE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'createStrategy',
                    summary: 'Create a strategy',
                    description:
                        'Creates a strategy type based on the supplied data.',
                    requestBody: createRequestSchema('createStrategySchema'),
                    responses: {
                        201: resourceCreatedResponseSchema('strategySchema'),
                        ...getStandardResponses(401, 403, 409, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:name',
            handler: this.updateStrategy,
            permission: UPDATE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    summary: 'Update a strategy type',
                    description:
                        'Updates the specified strategy type. Any properties not specified in the request body are left untouched.',
                    operationId: 'updateStrategy',
                    requestBody: createRequestSchema('updateStrategySchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:strategyName/deprecate',
            handler: this.deprecateStrategy,
            permission: UPDATE_STRATEGY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    summary: 'Deprecate a strategy',
                    description: 'Marks the specified strategy as deprecated.',
                    operationId: 'deprecateStrategy',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:strategyName/reactivate',
            handler: this.reactivateStrategy,
            permission: UPDATE_STRATEGY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'reactivateStrategy',
                    summary: 'Reactivate a strategy',
                    description:
                        "Marks the specified strategy as not deprecated. If the strategy wasn't already deprecated, nothing changes.",
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getAllStrategies(
        req: Request,
        res: Response<StrategiesSchema>,
    ): Promise<void> {
        const strategies = await this.strategyService.getStrategies();

        this.openApiService.respondWithValidation(
            200,
            res,
            strategiesSchema.$id,
            { version, strategies },
        );
    }

    async getStrategy(
        req: Request,
        res: Response<StrategySchema>,
    ): Promise<void> {
        const strategy = await this.strategyService.getStrategy(
            req.params.name,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            strategySchema.$id,
            strategy,
        );
    }

    async removeStrategy(req: IAuthRequest, res: Response): Promise<void> {
        const strategyName = req.params.name;
        const userName = extractUsername(req);

        await this.strategyService.removeStrategy(
            strategyName,
            userName,
            req.user.id,
        );
        res.status(200).end();
    }

    async createStrategy(
        req: IAuthRequest<unknown, unknown, CreateStrategySchema>,
        res: Response<StrategySchema>,
    ): Promise<void> {
        const userName = extractUsername(req);

        const strategy = await this.strategyService.createStrategy(
            req.body,
            userName,
            req.user.id,
        );
        this.openApiService.respondWithValidation(
            201,
            res,
            strategySchema.$id,
            strategy,
            { location: `strategies/${strategy.name}` },
        );
    }

    async updateStrategy(
        req: IAuthRequest<{ name: string }, UpdateStrategySchema>,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);

        await this.strategyService.updateStrategy(
            { ...req.body, name: req.params.name },
            userName,
            req.user.id,
        );
        res.status(200).end();
    }

    async deprecateStrategy(
        req: IAuthRequest,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;

        await this.strategyService.deprecateStrategy(
            strategyName,
            userName,
            req.user.id,
        );
        res.status(200).end();
    }

    async reactivateStrategy(
        req: IAuthRequest,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;

        await this.strategyService.reactivateStrategy(
            strategyName,
            userName,
            req.user.id,
        );
        res.status(200).end();
    }
}

export default StrategyController;
