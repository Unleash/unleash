import { Response } from 'express';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services';
import {
    CREATE_FEATURE,
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../types';
import { Logger } from '../../logger';
import {
    CreateDependentFeatureSchema,
    createRequestSchema,
    emptyResponse,
    getStandardResponses,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { InvalidOperationError } from '../../error';
import { DependentFeaturesService } from './dependent-features-service';
import { TransactionCreator, UnleashTransaction } from '../../db/transaction';

interface FeatureParams {
    featureName: string;
}

const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:featureName`;
const PATH_DEPENDENCIES = `${PATH_FEATURE}/dependencies`;

type DependentFeaturesServices = Pick<
    IUnleashServices,
    'transactionalDependentFeaturesService' | 'openApiService'
>;

export default class DependentFeaturesController extends Controller {
    private transactionalDependentFeaturesService: (
        db: UnleashTransaction,
    ) => DependentFeaturesService;

    private readonly startTransaction: TransactionCreator<UnleashTransaction>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            transactionalDependentFeaturesService,
            openApiService,
        }: DependentFeaturesServices,
        startTransaction: TransactionCreator<UnleashTransaction>,
    ) {
        super(config);
        this.transactionalDependentFeaturesService =
            transactionalDependentFeaturesService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.startTransaction = startTransaction;
        this.logger = config.getLogger(
            '/dependent-features/dependent-feature-service.ts',
        );

        this.route({
            method: 'post',
            path: PATH_DEPENDENCIES,
            handler: this.addFeatureDependency,
            permission: CREATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Add a feature dependency.',
                    description:
                        'Add a dependency to a parent feature. Each environment will resolve corresponding dependency independently.',
                    operationId: 'addFeatureDependency',
                    requestBody: createRequestSchema(
                        'createDependentFeatureSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async addFeatureDependency(
        req: IAuthRequest<FeatureParams, any, CreateDependentFeatureSchema>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const { variants, enabled, feature } = req.body;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.startTransaction(async (tx) =>
                this.transactionalDependentFeaturesService(
                    tx,
                ).upsertFeatureDependency(featureName, {
                    variants,
                    enabled,
                    feature,
                }),
            );
            res.status(200).end();
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }
}
