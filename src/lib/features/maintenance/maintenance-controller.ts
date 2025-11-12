import {
    ADMIN,
    UPDATE_MAINTENANCE_MODE,
    type IUnleashConfig,
} from '../../types/index.js';
import type { Request, Response } from 'express';
import Controller from '../../routes/controller.js';
import type { Logger } from '../../logger.js';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
} from '../../openapi/index.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import {
    type MaintenanceSchema,
    maintenanceSchema,
} from '../../openapi/spec/maintenance-schema.js';
import type MaintenanceService from '../../features/maintenance/maintenance-service.js';
import type { ToggleMaintenanceSchema } from '../../openapi/spec/toggle-maintenance-schema.js';

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
            permission: [ADMIN, UPDATE_MAINTENANCE_MODE],
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
            permission: [ADMIN, UPDATE_MAINTENANCE_MODE],
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
        req: IAuthRequest<{}, unknown, ToggleMaintenanceSchema>,
        res: Response<MaintenanceSchema>,
    ): Promise<void> {
        await this.maintenanceService.toggleMaintenanceMode(
            req.body,
            req.audit,
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
