import { Request, Response } from 'express';
import Controller from '../controller';
import { NONE, UPDATE_APPLICATION } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import ClientInstanceService from '../../features/metrics/instance/instance-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { ApplicationSchema } from '../../openapi/spec/application-schema';
import {
    applicationsSchema,
    ApplicationsSchema,
} from '../../openapi/spec/applications-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { CreateApplicationSchema } from '../../openapi/spec/create-application-schema';
import { IAuthRequest } from '../unleash-types';
import { extractUserIdFromUser } from '../../util';
import { IFlagResolver, serializeDates } from '../../types';
import { NotFoundError } from '../../error';
import {
    ApplicationOverviewSchema,
    applicationOverviewSchema,
} from '../../openapi/spec/application-overview-schema';
import { OpenApiService } from '../../services';
import { applicationsQueryParameters } from '../../openapi/spec/applications-query-parameters';

class MetricsController extends Controller {
    private logger: Logger;

    private clientInstanceService: ClientInstanceService;

    private flagResolver: IFlagResolver;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            clientInstanceService,
            openApiService,
        }: Pick<IUnleashServices, 'clientInstanceService' | 'openApiService'>,
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
                    tags: ['Unstable'],
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
    }

    async deprecated(req: Request, res: Response): Promise<void> {
        res.status(410).json({
            lastHour: {},
            lastMinute: {},
            maturity: 'deprecated',
        });
    }

    async deleteApplication(
        req: Request<{ appName: string }>,
        res: Response,
    ): Promise<void> {
        const { appName } = req.params;

        await this.clientInstanceService.deleteApplication(appName);
        res.status(200).end();
    }

    async createApplication(
        req: Request<{ appName: string }, unknown, CreateApplicationSchema>,
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
        req: IAuthRequest,
        res: Response<ApplicationsSchema>,
    ): Promise<void> {
        const { user } = req;
        const { query, offset, limit = '50', sortOrder, sortBy } = req.query;

        const normalizedQuery = query
            ?.split(',')
            .map((query) => query.trim())
            .filter((query) => query);

        const normalizedLimit =
            Number(limit) > 0 && Number(limit) <= 1000 ? Number(limit) : 1000;
        const normalizedOffset = Number(offset) > 0 ? Number(offset) : 0;
        const normalizedSortBy: string = sortBy ? sortBy : 'appName';
        const normalizedSortOrder =
            sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';

        const applications = await this.clientInstanceService.getApplications(
            {
                searchParams: normalizedQuery,
                offset: normalizedOffset,
                limit: normalizedLimit,
                sortBy: normalizedSortBy,
                sortOrder: normalizedSortOrder,
            },
            extractUserIdFromUser(user),
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            applicationsSchema.$id,
            applications,
        );
    }

    async getApplication(
        req: Request,
        res: Response<ApplicationSchema>,
    ): Promise<void> {
        const { appName } = req.params;

        const appDetails =
            await this.clientInstanceService.getApplication(appName);
        res.json(appDetails);
    }
    async getApplicationOverview(
        req: Request,
        res: Response<ApplicationOverviewSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('sdkReporting')) {
            throw new NotFoundError();
        }
        const { appName } = req.params;
        const overview =
            await this.clientInstanceService.getApplicationOverview(appName);

        this.openApiService.respondWithValidation(
            200,
            res,
            applicationOverviewSchema.$id,
            serializeDates(overview),
        );
    }
}
export default MetricsController;
