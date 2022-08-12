import { Response, Request } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { OpenApiService } from '../../services/openapi-service';
import { NONE } from '../../types/permissions';
import { ProxyService } from '../../services/proxy-service';
import ApiUser from '../../types/api-user';
import { ProxyFeaturesSchema } from '../../openapi/spec/proxy-features-schema';

interface ApiUserRequest extends Request {
    user: ApiUser;
}

export default class ProxyController extends Controller {
    private readonly logger: Logger;

    private proxyService: ProxyService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            proxyService,
            openApiService,
        }: Pick<IUnleashServices, 'proxyService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('client-api/feature.js');
        this.proxyService = proxyService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getProxyFeatures,
            permission: NONE,
            middleware: [],
        });
    }

    private async getProxyFeatures(
        req: ApiUserRequest,
        res: Response<ProxyFeaturesSchema>,
    ) {
        res.json({
            toggles: await this.proxyService.getProxyFeatures(req.user),
        });
    }
}
