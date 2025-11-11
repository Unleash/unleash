import type { Request, Response } from 'express';
import Controller from '../controller.js';
import { NONE, UPDATE_APPLICATION } from '../../types/permissions.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type { Logger } from '../../logger.js';
import type ClientInstanceService from '../../features/metrics/instance/instance-service.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type { ApplicationSchema } from '../../openapi/spec/application-schema.js';
import type { ApplicationsSchema } from '../../openapi/spec/applications-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { CreateApplicationSchema } from '../../openapi/spec/create-application-schema.js';
import type { IAuthRequest } from '../unleash-types.js';
import { extractUserIdFromUser } from '../../util/index.js';
import { type IFlagResolver, serializeDates } from '../../types/index.js';
import {
    type ApplicationOverviewSchema,
    applicationOverviewSchema,
} from '../../openapi/spec/application-overview-schema.js';
import type { OpenApiService } from '../../services/index.js';
import { applicationsQueryParameters } from '../../openapi/spec/applications-query-parameters.js';
import {
    normalizeQueryParams,
    type SearchParams,
} from '../../features/feature-search/search-utils.js';
import {
    applicationEnvironmentInstancesSchema,
    type ApplicationEnvironmentInstancesSchema,
} from '../../openapi/spec/application-environment-instances-schema.js';
import {
    outdatedSdksSchema,
    type OutdatedSdksSchema,
} from '../../openapi/spec/outdated-sdks-schema.js';
import UnknownFlagsController from '../../features/metrics/unknown-flags/unknown-flags-controller.js';

class MetricsController extends Controller {
    private logger: Logger;

    private clientInstanceService: ClientInstanceService;

    private flagResolver: IFlagResolver;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            clientInstanceService,
            unknownFlagsService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'clientInstanceService' | 'unknownFlagsService' | 'openApiService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/metrics.ts');

        this.clientInstanceService = clientInstanceService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        // deprecated routes
        this.get('/seen-toggles', this.deprecated);
        this.get('/seen-apps', this.deprecated);
        this.get('/feature-toggles', this.deprecated);
        this.get('/feature-toggles/:name', this.deprecated);

        this.use(
            '/unknown-flags',
            new UnknownFlagsController(config, {
                unknownFlagsService,
                openApiService,
            }).router,
        );

        this.route({
            method: 'post',
            path: '/applications/:appName',
            handler: this.createApplication,
            permission: UPDATE_APPLICATION,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'createApplication',
                    summary:
                        'Create an application to connect reported metrics',
                    description:
                        'Is used to report usage as well which sdk the application uses',
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                    requestBody: createRequestSchema('createApplicationSchema'),
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/applications/:appName',
            handler: this.deleteApplication,
            permission: UPDATE_APPLICATION,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'deleteApplication',
                    summary: 'Delete an application',
                    description: `Delete the application specified in the request URL. Returns 200 OK if the application was successfully deleted or if it didn't exist`,
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/applications',
            handler: this.getApplications,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    summary: 'Get all applications',
                    description:
                        'Returns all applications registered with Unleash. Applications can be created via metrics reporting or manual creation',
                    parameters: [...applicationsQueryParameters],
                    operationId: 'getApplications',
                    responses: {
                        200: createResponseSchema('applicationsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/applications/:appName',
            handler: this.getApplication,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getApplication',
                    summary: 'Get application data',
                    description:
                        'Returns data about the specified application (`appName`). The data contains information on the name of the application, sdkVersion (which sdk reported these metrics, typically `unleash-client-node:3.4.1` or `unleash-client-java:7.1.0`), as well as data about how to display this application in a list.',
                    responses: {
                        200: createResponseSchema('applicationSchema'),
                        ...getStandardResponses(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/applications/:appName/overview',
            handler: this.getApplicationOverview,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getApplicationOverview',
                    summary: 'Get application overview',
                    description:
                        'Returns an overview of the specified application (`appName`).',
                    responses: {
                        200: createResponseSchema('applicationOverviewSchema'),
                        ...getStandardResponses(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/instances/:appName/environment/:environment',
            handler: this.getApplicationEnvironmentInstances,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getApplicationEnvironmentInstances',
                    summary: 'Get application environment instances (Last 24h)',
                    description:
                        'Returns an overview of the instances for the given `appName` and `environment` that have received traffic in the last 24 hours.',
                    responses: {
                        200: createResponseSchema(
                            'applicationEnvironmentInstancesSchema',
                        ),
                        ...getStandardResponses(404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/sdks/outdated',
            handler: this.getOutdatedSdks,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getOutdatedSdks',
                    summary: 'Get outdated SDKs',
                    description:
                        'Returns a list of the outdated SDKS with the applications using them.',
                    responses: {
                        200: createResponseSchema('outdatedSdksSchema'),
                        ...getStandardResponses(404),
                    },
                }),
            ],
        });
    }

    async deprecated(req: Request, res: Response): Promise<void> {
        res.status(410).json({
            lastHour: {},
            lastMinute: {},
            maturity: 'deprecated',
        });
    }

    async deleteApplication(
        req: Request<{
            appName: string;
        }>,
        res: Response,
    ): Promise<void> {
        const { appName } = req.params;

        await this.clientInstanceService.deleteApplication(appName);
        res.status(200).end();
    }

    async createApplication(
        req: Request<
            {
                appName: string;
            },
            unknown,
            CreateApplicationSchema
        >,
        res: Response,
    ): Promise<void> {
        const input = {
            ...req.body,
            appName: req.params.appName,
        };
        await this.clientInstanceService.createApplication(input);
        res.status(202).end();
    }

    async getApplications(
        req: IAuthRequest<
            undefined,
            ApplicationsSchema,
            unknown,
            SearchParams & { sortBy: string }
        >,
        res: Response<ApplicationsSchema>,
    ): Promise<void> {
        const { user } = req;
        const {
            normalizedQuery,
            normalizedSortOrder,
            normalizedOffset,
            normalizedLimit,
        } = normalizeQueryParams(req.query, {
            limitDefault: 1000,
            maxLimit: 1000,
        });

        const applications = await this.clientInstanceService.getApplications(
            {
                searchParams: normalizedQuery,
                offset: normalizedOffset,
                limit: normalizedLimit,
                sortBy: req.query.sortBy || 'appName',
                sortOrder: normalizedSortOrder,
            },
            extractUserIdFromUser(user),
        );
        res.json(applications);
    }

    async getApplication(
        req: Request<{ appName: string }>,
        res: Response<ApplicationSchema>,
    ): Promise<void> {
        const { appName } = req.params;

        const appDetails =
            await this.clientInstanceService.getApplication(appName);
        res.json(appDetails);
    }

    async getApplicationOverview(
        req: IAuthRequest<{ appName: string }>,
        res: Response<ApplicationOverviewSchema>,
    ): Promise<void> {
        const { appName } = req.params;
        const { user } = req;
        const overview =
            await this.clientInstanceService.getApplicationOverview(
                appName,
                extractUserIdFromUser(user),
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            applicationOverviewSchema.$id,
            serializeDates(overview),
        );
    }

    async getOutdatedSdks(req: Request, res: Response<OutdatedSdksSchema>) {
        const outdatedSdks = await this.clientInstanceService.getOutdatedSdks();

        this.openApiService.respondWithValidation(
            200,
            res,
            outdatedSdksSchema.$id,
            { sdks: outdatedSdks },
        );
    }

    async getApplicationEnvironmentInstances(
        req: Request<{ appName: string; environment: string }>,
        res: Response<ApplicationEnvironmentInstancesSchema>,
    ): Promise<void> {
        const { appName, environment } = req.params;
        const instances =
            await this.clientInstanceService.getRecentApplicationEnvironmentInstances(
                appName,
                environment,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            applicationEnvironmentInstancesSchema.$id,
            serializeDates({ instances }),
        );
    }
}

export default MetricsController;
