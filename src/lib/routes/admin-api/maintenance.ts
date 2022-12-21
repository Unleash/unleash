import { ADMIN, IUnleashConfig, IUnleashServices } from '../../types';
import { Request, Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
} from '../../openapi';
import { OpenApiService } from '../../services';
import { IAuthRequest } from '../unleash-types';
import { extractUsername } from '../../util';
import {
    MaintenanceSchema,
    maintenanceSchema,
} from '../../openapi/spec/maintenance-schema';
import MaintenanceService from 'lib/services/maintenance-service';
import { InvalidOperationError } from '../../error';

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
                    tags: ['Maintenance'],
                    operationId: 'toggleMaintenance',
                    responses: {
                        204: emptyResponse,
                    },
                    requestBody: createRequestSchema('maintenanceSchema'),
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
                    tags: ['Maintenance'],
                    operationId: 'getMaintenance',
                    responses: {
                        200: createResponseSchema('maintenanceSchema'),
                    },
                }),
            ],
        });
    }

    async toggleMaintenance(
        req: IAuthRequest<unknown, unknown, MaintenanceSchema>,
        res: Response,
    ): Promise<void> {
        this.verifyMaintenanceEnabled();
        await this.maintenanceService.toggleMaintenanceMode(
            req.body,
            extractUsername(req),
        );
        res.status(204).end();
    }

    async getMaintenance(req: Request, res: Response): Promise<void> {
        this.verifyMaintenanceEnabled();
        const settings = await this.maintenanceService.getMaintenanceSetting();
        this.openApiService.respondWithValidation(
            200,
            res,
            maintenanceSchema.$id,
            settings,
        );
    }

    private verifyMaintenanceEnabled() {
        if (!this.config.flagResolver.isEnabled('maintenance')) {
            throw new InvalidOperationError('Maintenance is not enabled');
        }
    }
}
module.exports = MaintenanceController;
