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
import { emptyResponse } from '../../openapi/util/standard-responses';
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
import { UpsertStrategySchema } from '../../openapi/spec/upsert-strategy-schema';

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
                    tags: ['Strategies'],
                    operationId: 'getAllStrategies',
                    responses: {
                        200: createResponseSchema('strategiesSchema'),
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
                    tags: ['Strategies'],
                    operationId: 'getStrategy',
                    responses: { 200: createResponseSchema('strategySchema') },
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
                    tags: ['Strategies'],
                    operationId: 'removeStrategy',
                    responses: { 200: emptyResponse },
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
                    requestBody: createRequestSchema('upsertStrategySchema'),
                    responses: {
                        201: resourceCreatedResponseSchema('strategySchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:strategyName',
            handler: this.updateStrategy,
            permission: UPDATE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'updateStrategy',
                    requestBody: createRequestSchema('upsertStrategySchema'),
                    responses: { 200: emptyResponse },
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
                    operationId: 'deprecateStrategy',
                    responses: { 200: emptyResponse },
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
                    responses: { 200: emptyResponse },
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

        await this.strategyService.removeStrategy(strategyName, userName);
        res.status(200).end();
    }

    async createStrategy(
        req: IAuthRequest<unknown, UpsertStrategySchema>,
        res: Response<StrategySchema>,
    ): Promise<void> {
        const userName = extractUsername(req);

        const strategy = await this.strategyService.createStrategy(
            req.body,
            userName,
        );
        res.header('location', `strategies/${strategy.name}`)
            .status(201)
            .json(strategy)
            .end();
    }

    async updateStrategy(
        req: IAuthRequest<unknown, UpsertStrategySchema>,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);

        await this.strategyService.updateStrategy(req.body, userName);
        res.status(200).end();
    }

    async deprecateStrategy(
        req: IAuthRequest,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;

        if (strategyName === 'default') {
            res.status(403).end();
            return;
        }

        await this.strategyService.deprecateStrategy(strategyName, userName);
        res.status(200).end();
    }

    async reactivateStrategy(
        req: IAuthRequest,
        res: Response<void>,
    ): Promise<void> {
        const userName = extractUsername(req);
        const { strategyName } = req.params;

        await this.strategyService.reactivateStrategy(strategyName, userName);
        res.status(200).end();
    }
}

export default StrategyController;
