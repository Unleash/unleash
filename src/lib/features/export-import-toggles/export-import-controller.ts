import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { Logger } from '../../logger.js';
import type {
    IExportService,
    IImportService,
} from './export-import-service.js';
import type { OpenApiService, IUnleashServices } from '../../services/index.js';
import type { WithTransactional } from '../../db/transaction.js';
import {
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    type ExportQuerySchema,
    exportResultSchema,
    getStandardResponses,
    type ImportTogglesSchema,
    importTogglesValidateSchema,
} from '../../openapi/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import { extractUsername } from '../../util/index.js';
import { BadDataError } from '../../error/index.js';
import ApiUser from '../../types/api-user.js';

class ExportImportController extends Controller {
    private logger: Logger;

    private exportService: IExportService;

    private importService: WithTransactional<IImportService>;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            exportService,
            importService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'exportService' | 'importService' | 'openApiService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/export-import.ts');
        this.exportService = exportService;
        this.importService = importService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '/export',
            permission: NONE,
            handler: this.export,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'exportFeatures',
                    requestBody: createRequestSchema('exportQuerySchema'),
                    responses: {
                        200: createResponseSchema('exportResultSchema'),
                        ...getStandardResponses(404),
                    },
                    description:
                        "Exports all features listed in the `features` property from the environment specified in the request body. If set to `true`, the `downloadFile` property will let you download a file with the exported data. Otherwise, the export data is returned directly as JSON. Refer to the documentation for more information about [Unleash's export functionality](https://docs.getunleash.io/reference/deploy/environment-import-export#export).",
                    summary: 'Export feature flags from an environment',
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate',
            permission: NONE,
            handler: this.validateImport,
            middleware: [
                openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'validateImport',
                    requestBody: createRequestSchema('importTogglesSchema'),
                    responses: {
                        200: createResponseSchema(
                            'importTogglesValidateSchema',
                        ),
                        ...getStandardResponses(404),
                    },
                    summary: 'Validate feature import data',
                    description: `Validates a feature flag data set. Checks whether the data can be imported into the specified project and environment. The returned value is an object that contains errors, warnings, and permissions required to perform the import, as described in the [import documentation](https://docs.getunleash.io/reference/deploy/environment-import-export#import).`,
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/import',
            permission: NONE,
            handler: this.importData,
            middleware: [
                openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'importToggles',
                    requestBody: createRequestSchema('importTogglesSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(404),
                    },
                    summary: 'Import feature flags',
                    description: `[Import feature flags](https://docs.getunleash.io/reference/deploy/environment-import-export#import) into a specific project and environment.`,
                }),
            ],
        });
    }

    async export(
        req: IAuthRequest<{}, unknown, ExportQuerySchema, {}>,
        res: Response,
    ): Promise<void> {
        const query = req.body;
        const userName = extractUsername(req);

        const data = await this.exportService.export(query, req.audit);

        this.openApiService.respondWithValidation(
            200,
            res,
            exportResultSchema.$id,
            serializeDates(data),
        );
    }

    async validateImport(
        req: IAuthRequest<{}, unknown, ImportTogglesSchema, {}>,
        res: Response,
    ): Promise<void> {
        const dto = req.body;
        const { user } = req;

        const validation = await this.importService.transactional((service) =>
            service.validate(dto, user),
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            importTogglesValidateSchema.$id,
            validation,
        );
    }

    async importData(
        req: IAuthRequest<{}, unknown, ImportTogglesSchema, {}>,
        res: Response,
    ): Promise<void> {
        const { user, audit } = req;

        if (user instanceof ApiUser && user.type === 'admin') {
            throw new BadDataError(
                `You can't use an admin token to import features. Please use either a personal access token (https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens) or a service account (https://docs.getunleash.io/reference/service-accounts).`,
            );
        }

        const dto = req.body;

        await this.importService.transactional((service) =>
            service.import(dto, user, audit),
        );

        res.status(200).end();
    }
}
export default ExportImportController;
