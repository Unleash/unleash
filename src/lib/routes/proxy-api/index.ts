import { Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import FeatureToggleService from '../../services/feature-toggle-service';
import { Logger } from '../../logger';

import { OpenApiService } from '../../services/openapi-service';
import { NONE } from '../../types/permissions';
import { IAuthRequest } from 'lib/server-impl';

export default class ProxyController extends Controller {
    private readonly logger: Logger;

    private featureToggleServiceV2: FeatureToggleService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'openApiService'>,
    ) {
        super(config);
        this.featureToggleServiceV2 = featureToggleServiceV2;

        this.openApiService = openApiService;
        this.logger = config.getLogger('client-api/feature.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getProxyFeatures,
            permission: NONE,
            middleware: [],
        });
    }

    private getProxyFeatures(req: IAuthRequest, res: Response) {
        const key = req.header('Authorization');
        console.log(key);
        console.log(req.user);

        res.json([
            { name: 'feature1', enabled: true },
            { name: 'feature2', enabled: false },
        ]);
        // Get all the features here
    }
}
