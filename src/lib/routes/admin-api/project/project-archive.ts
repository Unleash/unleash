import { Response } from 'express';
import { IUnleashConfig } from '../../../types/option';
import { IFlagResolver, IProjectParam, IUnleashServices } from '../../../types';
import { Logger } from '../../../logger';
import { extractUsername } from '../../../util/extract-user';
import { DELETE_FEATURE } from '../../../types/permissions';
import FeatureToggleService from '../../../services/feature-toggle-service';
import { IAuthRequest } from '../../unleash-types';
import { OpenApiService } from '../../../services/openapi-service';
import { emptyResponse } from '../../../openapi/util/standard-responses';
import { BatchFeaturesSchema, createRequestSchema } from '../../../openapi';
import NotFoundError from '../../../error/notfound-error';
import Controller from '../../controller';

const PATH = '/:projectId/archive';
const PATH_DELETE = `${PATH}/delete`;

export default class ProjectArchiveController extends Controller {
    private readonly logger: Logger;

    private featureService: FeatureToggleService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleServiceV2;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'post',
            path: PATH_DELETE,
            acceptAnyContentType: true,
            handler: this.deleteFeatures,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'deleteFeatures',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async deleteFeatures(
        req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>,
        res: Response<void>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('bulkOperations')) {
            throw new NotFoundError('Bulk operations are not enabled');
        }
        const { projectId } = req.params;
        const { features } = req.body;
        const user = extractUsername(req);
        await this.featureService.deleteFeatures(features, projectId, user);
        res.status(200).end();
    }
}

module.exports = ProjectArchiveController;
