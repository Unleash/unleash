import { ADMIN, IUnleashConfig, IUnleashServices } from '../../types';
import { Request, Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
} from '../../openapi';
import { OpenApiService } from '../../services';
import { IAuthRequest } from '../unleash-types';
import { extractUsername } from '../../util';
import {
    MaintenanceSchema,
    maintenanceSchema,
} from '../../openapi/spec/maintenance-schema';
import MaintenanceService from 'lib/services/maintenance-service';

export default class MaintenanceController extends Controller {
    private maintenanceService: MaintenanceService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            maintenanceService,
            openApiService,
        }: Pick<IUnleashServices, 'maintenanceService' | 'openApiService'>,
    ) {
        super(config);
        this.maintenanceService = maintenanceService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('routes/admin-api/maintenance');
        this.route({
            method: 'post',
            path: '',
            permission: ADMIN,
            handler: this.toggleMaintenance,
            middleware: [
                this.openApiService.validPath({
                    summary: 'Enabled/disabled maintenance mode',
                    description:
                        'Lets administrators put Unleash into a mostly read-only mode. While Unleash is in maintenance mode, users can not change any configuration settings',
                    tags: ['Maintenance'],
                    operationId: 'toggleMaintenance',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                    requestBody: createRequestSchema('toggleMaintenanceSchema'),
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '',
            permission: ADMIN,
            handler: this.getMaintenance,
            middleware: [
                this.openApiService.validPath({
                    summary: 'Get maintenance mode status',
                    description:
                        'Tells you whether maintenance mode is enabled or disabled',
                    tags: ['Maintenance'],
                    operationId: 'getMaintenance',
                    responses: {
                        200: createResponseSchema('maintenanceSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async toggleMaintenance(
        req: IAuthRequest<unknown, unknown, MaintenanceSchema>,
        res: Response,
    ): Promise<void> {
        await this.maintenanceService.toggleMaintenanceMode(
            req.body,
            extractUsername(req),
        );
        res.status(204).end();
    }

    async getMaintenance(req: Request, res: Response): Promise<void> {
        const settings = await this.maintenanceService.getMaintenanceSetting();
        this.openApiService.respondWithValidation(
            200,
            res,
            maintenanceSchema.$id,
            settings,
        );
    }
}
module.exports = MaintenanceController;
