import { Response } from 'express';
import Controller from '../../routes/controller';
import { Logger } from '../../logger';
import ExportImportService from './export-import-service';
import { OpenApiService } from '../../services';
import {
    TransactionCreator,
    UnleashTransaction,
    WithTransactional,
} from '../../db/transaction';
import {
    IUnleashConfig,
    IUnleashServices,
    NONE,
    serializeDates,
} from '../../types';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    ExportQuerySchema,
    exportResultSchema,
    getStandardResponses,
    ImportTogglesSchema,
    importTogglesValidateSchema,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { extractUsername } from '../../util';
import { BadDataError, InvalidOperationError } from '../../error';
import ApiUser from '../../types/api-user';

class ExportImportController extends Controller {
    private logger: Logger;

    /** @deprecated gradually rolling out exportImportV2 */
    private exportImportService: ExportImportService;

    /** @deprecated gradually rolling out exportImportV2 */
    private transactionalExportImportService: (
        db: UnleashTransaction,
    ) => ExportImportService;

    private exportImportServiceV2: WithTransactional<ExportImportService>;

    private openApiService: OpenApiService;

    /** @deprecated gradually rolling out exportImportV2 */
    private readonly startTransaction: TransactionCreator<UnleashTransaction>;

    constructor(
        config: IUnleashConfig,
        {
            exportImportService,
            transactionalExportImportService,
            exportImportServiceV2,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'exportImportService'
            | 'exportImportServiceV2'
            | 'openApiService'
            | 'transactionalExportImportService'
        >,
        startTransaction: TransactionCreator<UnleashTransaction>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/export-import.ts');
        this.exportImportService = exportImportService;
        this.transactionalExportImportService =
            transactionalExportImportService;
        this.exportImportServiceV2 = exportImportServiceV2;
        this.startTransaction = startTransaction;
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
                    summary: 'Export feature toggles from an environment',
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
                    description: `Validates a feature toggle data set. Checks whether the data can be imported into the specified project and environment. The returned value is an object that contains errors, warnings, and permissions required to perform the import, as described in the [import documentation](https://docs.getunleash.io/reference/deploy/environment-import-export#import).`,
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
                    summary: 'Import feature toggles',
                    description: `[Import feature toggles](https://docs.getunleash.io/reference/deploy/environment-import-export#import) into a specific project and environment.`,
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
        const data = await this.exportImportServiceV2.export(query, userName);

        this.openApiService.respondWithValidation(
            200,
            res,
            exportResultSchema.$id,
            serializeDates(data),
        );
    }

    async validateImport(
        req: IAuthRequest<unknown, unknown, ImportTogglesSchema, unknown>,
        res: Response,
    ): Promise<void> {
        this.verifyExportImportEnabled();
        const dto = req.body;
        const { user } = req;

        const useTransactionalDecorator = this.config.flagResolver.isEnabled(
            'transactionalDecorator',
        );
        const validation = useTransactionalDecorator
            ? await this.exportImportServiceV2.transactional((service) =>
                  service.validate(dto, user),
              )
            : await this.startTransaction(async (tx) =>
                  this.transactionalExportImportService(tx).validate(dto, user),
              );

        this.openApiService.respondWithValidation(
            200,
            res,
            importTogglesValidateSchema.$id,
            validation,
        );
    }

    async importData(
        req: IAuthRequest<unknown, unknown, ImportTogglesSchema, unknown>,
        res: Response,
    ): Promise<void> {
        this.verifyExportImportEnabled();
        const { user } = req;

        if (user instanceof ApiUser && user.type === 'admin') {
            throw new BadDataError(
                `You can't use an admin token to import features. Please use either a personal access token (https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens) or a service account (https://docs.getunleash.io/reference/service-accounts).`,
            );
        }

        const dto = req.body;

        const useTransactionalDecorator = this.config.flagResolver.isEnabled(
            'transactionalDecorator',
        );

        if (useTransactionalDecorator) {
            await this.exportImportServiceV2.transactional((service) =>
                service.import(dto, user),
            );
        } else {
            await this.startTransaction(async (tx) =>
                this.transactionalExportImportService(tx).import(dto, user),
            );
        }

        res.status(200).end();
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
