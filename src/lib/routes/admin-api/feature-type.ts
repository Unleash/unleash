import { Request, Response } from 'express';
import { IUnleashServices } from '../../types/services';
import FeatureTypeService from '../../services/feature-type-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { OpenApiService } from '../../services/openapi-service';
import { NONE } from '../../types/permissions';
import { FeatureTypesSchema } from '../../openapi/spec/feature-types-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import Controller from '../controller';

const version = 1;

export class FeatureTypeController extends Controller {
    private featureTypeService: FeatureTypeService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureTypeService,
            openApiService,
        }: Pick<IUnleashServices, 'featureTypeService' | 'openApiService'>,
    ) {
        super(config);
        this.featureTypeService = featureTypeService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/feature-type.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllFeatureTypes,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'getAllFeatureTypes',
                    responses: {
                        200: createResponseSchema('featureTypesSchema'),
                    },
                }),
            ],
        });
    }

    async getAllFeatureTypes(
        req: Request,
        res: Response<FeatureTypesSchema>,
    ): Promise<void> {
        res.json({
            version,
            types: await this.featureTypeService.getAll(),
        });
    }
}
