import { Request, Response } from 'express';
import Controller from '../controller';
import { NONE, UPDATE_APPLICATION } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import ClientInstanceService from '../../services/client-metrics/instance-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { ApplicationSchema } from '../../openapi/spec/application-schema';
import { ApplicationsSchema } from '../../openapi/spec/applications-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { RequestsPerSecondSegmentedSchema } from 'lib/openapi/spec/requests-per-second-segmented-schema';
import { IFlagResolver } from 'lib/types';

type RpsError = string;
class MetricsController extends Controller {
    private logger: Logger;

    private flagResolver: IFlagResolver;

    private clientInstanceService: ClientInstanceService;

    readonly baseUriPath: string;

    constructor(
        config: IUnleashConfig,
        {
            clientInstanceService,
            openApiService,
        }: Pick<IUnleashServices, 'clientInstanceService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/metrics.ts');
        this.flagResolver = config.flagResolver;
        this.baseUriPath = config.server.baseUriPath || '';

        this.clientInstanceService = clientInstanceService;

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
                    responses: {
                        202: emptyResponse,
                    },
                    requestBody: createRequestSchema('applicationSchema'),
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
                    responses: {
                        200: emptyResponse,
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
                    responses: {
                        200: createResponseSchema('applicationSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/rps',
            handler: this.getRps,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    operationId: 'getRequestsPerSecond',
                    responses: {
                        200: createResponseSchema(
                            'requestsPerSecondSegmentedSchema',
                        ),
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
        req: Request<{ appName: string }, unknown, ApplicationSchema>,
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
        req: Request,
        res: Response<ApplicationsSchema>,
    ): Promise<void> {
        const query = req.query.strategyName
            ? { strategyName: req.query.strategyName as string }
            : {};
        const applications = await this.clientInstanceService.getApplications(
            query,
        );
        res.json({ applications });
    }

    async getApplication(
        req: Request,
        res: Response<ApplicationSchema>,
    ): Promise<void> {
        const { appName } = req.params;

        const appDetails = await this.clientInstanceService.getApplication(
            appName,
        );
        res.json(appDetails);
    }

    async getRps(
        req: Request,
        res: Response<RequestsPerSecondSegmentedSchema | RpsError>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('networkView')) {
            res.status(404).send('Not enabled');
            return;
        }
        try {
            const hoursToQuery = 6;
            const [clientMetrics, adminMetrics] = await Promise.all([
                this.clientInstanceService.getRPSForPath(
                    `${this.baseUriPath}/api/client/.*`,
                    hoursToQuery,
                ),
                this.clientInstanceService.getRPSForPath(
                    `${this.baseUriPath}/api/admin/.*`,
                    hoursToQuery,
                ),
            ]);
            res.json({
                clientMetrics,
                adminMetrics,
            });
        } catch (err) {
            this.logger.error('Failed to fetch RPS metrics', err);
            res.status(500).send('Error fetching RPS metrics');
        }
    }
}
export default MetricsController;
