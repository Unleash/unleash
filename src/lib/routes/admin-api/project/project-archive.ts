import { Response } from 'express';
import { IUnleashConfig } from '../../../types/option';
import {
    IFlagResolver,
    IProjectParam,
    IUnleashServices,
    UPDATE_FEATURE,
} from '../../../types';
import { Logger } from '../../../logger';
import { extractUsername } from '../../../util/extract-user';
import { DELETE_FEATURE } from '../../../types/permissions';
import FeatureToggleService from '../../../services/feature-toggle-service';
import { IAuthRequest } from '../../unleash-types';
import { OpenApiService } from '../../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses';
import { BatchFeaturesSchema, createRequestSchema } from '../../../openapi';
import Controller from '../../controller';

const PATH = '/:projectId';
const PATH_ARCHIVE = `${PATH}/archive`;
const PATH_DELETE = `${PATH}/delete`;
const PATH_REVIVE = `${PATH}/revive`;

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
                    description:
                        'This endpoint deletes the specified features, that are in archive.',
                    summary: 'Deletes a list of features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_REVIVE,
            acceptAnyContentType: true,
            handler: this.reviveFeatures,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'reviveFeatures',
                    description:
                        'This endpoint revives the specified features.',
                    summary: 'Revives a list of features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_ARCHIVE,
            handler: this.archiveFeatures,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'archiveFeatures',
                    description:
                        'This endpoint archives the specified features.',
                    summary: 'Archives a list of features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
    }

    async deleteFeatures(
        req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { features } = req.body;
        const user = extractUsername(req);
        await this.featureService.deleteFeatures(features, projectId, user);
        res.status(200).end();
    }

    async reviveFeatures(
        req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { features } = req.body;
        const user = extractUsername(req);
        await this.featureService.reviveFeatures(features, projectId, user);
        res.status(200).end();
    }

    async archiveFeatures(
        req: IAuthRequest<IProjectParam, void, BatchFeaturesSchema>,
        res: Response,
    ): Promise<void> {
        const { features } = req.body;
        const { projectId } = req.params;
        const userName = extractUsername(req);

        await this.featureService.archiveToggles(features, userName, projectId);
        res.status(202).end();
    }
}

module.exports = ProjectArchiveController;
