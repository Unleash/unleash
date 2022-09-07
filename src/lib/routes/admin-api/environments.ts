import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import EnvironmentService from '../../services/environment-service';
import { Logger } from '../../logger';
import { ADMIN, NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    environmentsSchema,
    EnvironmentsSchema,
} from '../../openapi/spec/environments-schema';
import {
    environmentSchema,
    EnvironmentSchema,
} from '../../openapi/spec/environment-schema';
import { SortOrderSchema } from '../../openapi/spec/sort-order-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';

interface EnvironmentParam {
    name: string;
}

export class EnvironmentsController extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private service: EnvironmentService;

    constructor(
        config: IUnleashConfig,
        {
            environmentService,
            openApiService,
        }: Pick<IUnleashServices, 'environmentService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('admin-api/environments-controller.ts');
        this.openApiService = openApiService;
        this.service = environmentService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllEnvironments,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'getAllEnvironments',
                    responses: { 200: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getEnvironment,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'getEnvironment',
                    responses: {
                        200: createResponseSchema('environmentSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/sort-order',
            handler: this.updateSortOrder,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'updateSortOrder',
                    requestBody: createRequestSchema('sortOrderSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:name/on',
            acceptAnyContentType: true,
            handler: this.toggleEnvironmentOn,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'toggleEnvironmentOn',
                    responses: { 204: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:name/off',
            acceptAnyContentType: true,
            handler: this.toggleEnvironmentOff,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'toggleEnvironmentOff',
                    responses: { 204: emptyResponse },
                }),
            ],
        });
    }

    async getAllEnvironments(
        req: Request,
        res: Response<EnvironmentsSchema>,
    ): Promise<void> {
        this.openApiService.respondWithValidation(
            200,
            res,
            environmentsSchema.$id,
            { version: 1, environments: await this.service.getAll() },
        );
    }

    async updateSortOrder(
        req: Request<unknown, unknown, SortOrderSchema>,
        res: Response,
    ): Promise<void> {
        await this.service.updateSortOrder(req.body);
        res.status(200).end();
    }

    async toggleEnvironmentOn(
        req: Request<EnvironmentParam>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        await this.service.toggleEnvironment(name, true);
        res.status(204).end();
    }

    async toggleEnvironmentOff(
        req: Request<EnvironmentParam>,
        res: Response,
    ): Promise<void> {
        const { name } = req.params;
        await this.service.toggleEnvironment(name, false);
        res.status(204).end();
    }

    async getEnvironment(
        req: Request<EnvironmentParam>,
        res: Response<EnvironmentSchema>,
    ): Promise<void> {
        this.openApiService.respondWithValidation(
            200,
            res,
            environmentSchema.$id,
            await this.service.get(req.params.name),
        );
    }
}
