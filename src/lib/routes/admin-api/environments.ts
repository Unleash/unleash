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
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import {
    environmentsProjectSchema,
    EnvironmentsProjectSchema,
} from '../../openapi/spec/environments-project-schema';

interface EnvironmentParam {
    name: string;
}

interface ProjectParam {
    projectId: string;
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
                    summary: 'Get all environments',
                    description:
                        'Retrieves all environments that exist in this Unleash instance.',
                    operationId: 'getAllEnvironments',
                    responses: {
                        200: createResponseSchema('environmentsSchema'),
                        ...getStandardResponses(401, 403),
                    },
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
                    summary: 'Get the environment with `name`',
                    description:
                        'Retrieves the environment with `name` if it exists in this Unleash instance',
                    responses: {
                        200: createResponseSchema('environmentSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/project/:projectId',
            handler: this.getProjectEnvironments,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Environments'],
                    operationId: 'getProjectEnvironments',
                    summary: 'Get the environments available to a project',
                    description:
                        'Gets the environments that are available for this project. An environment is available for a project if enabled in the [project configuration](https://docs.getunleash.io/reference/environments#step-1-enable-new-environments-for-your-project)',
                    responses: {
                        200: createResponseSchema('environmentsProjectSchema'),
                        ...getStandardResponses(401, 403, 404),
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
                    summary: 'Update environment sort orders',
                    description:
                        'Updates sort orders for the named environments. Environments not specified are unaffected.',
                    operationId: 'updateSortOrder',
                    requestBody: createRequestSchema('sortOrderSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
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
                    summary: 'Toggle the environment with `name` on',
                    description:
                        'Makes it possible to enable this environment for a project. An environment must first be globally enabled using this endpoint before it can be enabled for a project',
                    operationId: 'toggleEnvironmentOn',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
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
                    summary: 'Toggle the environment with `name` off',
                    description:
                        'Removes this environment from the list of available environments for projects to use',
                    operationId: 'toggleEnvironmentOff',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
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

    async getProjectEnvironments(
        req: Request<ProjectParam>,
        res: Response<EnvironmentsProjectSchema>,
    ): Promise<void> {
        this.openApiService.respondWithValidation(
            200,
            res,
            environmentsProjectSchema.$id,
            {
                version: 1,
                environments: (await this.service.getProjectEnvironments(
                    req.params.projectId,
                )) as any,
            },
        );
    }
}
