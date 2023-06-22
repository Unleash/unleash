import { Response } from 'express';
import Controller from '../../routes/controller';
import { Logger } from '../../logger';
import ExportImportService from './export-import-service';
import { OpenApiService } from '../../services';
import { TransactionCreator, UnleashTransaction } from '../../db/transaction';
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
    ImportTogglesSchema,
    importTogglesValidateSchema,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { extractUsername } from '../../util';
import { BadDataError, InvalidOperationError } from '../../error';
import ApiUser from '../../types/api-user';

class ExportImportController extends Controller {
    private logger: Logger;

    private exportImportService: ExportImportService;

    private transactionalExportImportService: (
        db: UnleashTransaction,
    ) => ExportImportService;

    private openApiService: OpenApiService;

    private readonly startTransaction: TransactionCreator<UnleashTransaction>;

    constructor(
        config: IUnleashConfig,
        {
            exportImportService,
            transactionalExportImportService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'exportImportService'
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
        this.startTransaction = startTransaction;
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
        this.route({
            method: 'post',
            path: '/validate',
            permission: NONE,
            handler: this.validateImport,
            middleware: [
                openApiService.validPath({
                    summary:
                        'Validate import of feature toggles for an environment in the project',
                    description: `Unleash toggles exported from a different instance can be imported into a new project and environment`,
                    tags: ['Unstable'],
                    operationId: 'validateImport',
                    requestBody: createRequestSchema('importTogglesSchema'),
                    responses: {
                        200: createResponseSchema(
                            'importTogglesValidateSchema',
                        ),
                    },
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
                    summary:
                        'Import feature toggles for an environment in the project',
                    description: `Unleash toggles exported from a different instance can be imported into a new project and environment`,
                    tags: ['Unstable'],
                    operationId: 'importToggles',
                    requestBody: createRequestSchema('importTogglesSchema'),
                    responses: {
                        200: emptyResponse,
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
    }

    async validateImport(
        req: IAuthRequest<unknown, unknown, ImportTogglesSchema, unknown>,
        res: Response,
    ): Promise<void> {
        this.verifyExportImportEnabled();
        const dto = req.body;
        const { user } = req;
        const validation = await this.startTransaction(async (tx) =>
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

        await this.startTransaction(async (tx) =>
            this.transactionalExportImportService(tx).import(dto, user),
        );

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
