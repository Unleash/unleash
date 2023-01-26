import { Response } from 'express';
import Controller from '../controller';
import { NONE } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import { OpenApiService } from '../../services/openapi-service';
import ExportImportService from 'lib/services/export-import-service';
import { InvalidOperationError } from '../../error';
import { createRequestSchema, createResponseSchema } from '../../openapi';
import { exportResultSchema } from '../../openapi/spec/export-result-schema';
import { ExportQuerySchema } from '../../openapi/spec/export-query-schema';
import { serializeDates } from '../../types';
import { IAuthRequest } from '../unleash-types';
import { format as formatDate } from 'date-fns';
import { extractUsername } from '../../util';

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
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'exportFeatures',
                    requestBody: createRequestSchema('exportQuerySchema'),
                    responses: {
                        200: createResponseSchema('exportResultSchema'),
                    },
                }),
            ],
        });
    }

    async export(
        req: IAuthRequest<unknown, unknown, ExportQuerySchema, unknown>,
        res: Response,
    ): Promise<void> {
        this.verifyExportImportEnabled();
        const query = req.body;
        const userName = extractUsername(req);
        const data = await this.exportImportService.export(query, userName);

        this.openApiService.respondWithValidation(
            200,
            res,
            exportResultSchema.$id,
            serializeDates(data),
        );

        const timestamp = this.getFormattedDate(Date.now());
        if (query.downloadFile) {
            res.attachment(`export-${timestamp}.json`);
        } else {
            res.json(data);
        }
    }

    private getFormattedDate(millis: number): string {
        return formatDate(millis, 'yyyy-MM-dd_HH-mm-ss');
    }

    private verifyExportImportEnabled() {
        if (!this.config.flagResolver.isEnabled('featuresExportImport')) {
            throw new InvalidOperationError(
                'Feature export/import is not enabled',
            );
        }
    }
}
export default ExportImportController;
