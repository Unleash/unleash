import { Request, Response } from 'express';
import Controller from '../controller';
import { NONE } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import { OpenApiService } from '../../services/openapi-service';
import ExportImportService, {
    IExportQuery,
    IImportDTO,
} from 'lib/services/export-import-service';
import { InvalidOperationError } from '../../error';
import { IAuthRequest } from '../unleash-types';

class ExportImportController extends Controller {
    private logger: Logger;

    private exportImportService: ExportImportService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            exportImportService,
            openApiService,
        }: Pick<IUnleashServices, 'exportImportService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/export-import.ts');
        this.exportImportService = exportImportService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '/export',
            permission: NONE,
            handler: this.export,
            // middleware: [
            //     this.openApiService.validPath({
            //         tags: ['Import/Export'],
            //         operationId: 'export',
            //         responses: {
            //             200: createResponseSchema('stateSchema'),
            //         },
            //         parameters:
            //             exportQueryParameters as unknown as OpenAPIV3.ParameterObject[],
            //     }),
            // ],
        });
        this.route({
            method: 'post',
            path: '/import',
            permission: NONE,
            handler: this.importData,
        });
    }

    async export(
        req: Request<unknown, unknown, IExportQuery, unknown>,
        res: Response,
    ): Promise<void> {
        this.verifyExportImportEnabled();
        const query = req.body;
        const data = await this.exportImportService.export(query);

        res.json(data);
    }

    private verifyExportImportEnabled() {
        if (!this.config.flagResolver.isEnabled('featuresExportImport')) {
            throw new InvalidOperationError(
                'Feature export/import is not enabled',
            );
        }
    }

    async importData(
        req: IAuthRequest<unknown, unknown, IImportDTO, unknown>,
        res: Response,
    ): Promise<void> {
        const dto = req.body;
        const user = req.user;
        await this.exportImportService.import(dto, user);

        res.status(201).end();
    }
}
export default ExportImportController;
