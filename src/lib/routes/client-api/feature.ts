import memoizee from 'memoizee';
import { Request, Response } from 'express';
import { handleErrors } from '../admin-api/util';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import FeatureToggleService from '../../services/feature-toggle-service';
import { Logger } from '../../logger';

const version = 1;

const FEATURE_COLUMNS_CLIENT = [
    'name',
    'type',
    'enabled',
    'stale',
    'strategies',
    'variants',
];

export default class FeatureController extends Controller {
    private readonly logger: Logger;

    private featureToggleService: FeatureToggleService;

    private featureToggleServiceV2: FeatureToggleServiceV2;

    private readonly cache: boolean;

    private cachedFeatures: any;

    constructor(
        {
            featureToggleService,
            featureToggleServiceV2,
        }: Pick<
            IUnleashServices,
            'featureToggleServiceV2' | 'featureToggleService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        const { experimental } = config;
        this.featureToggleService = featureToggleService;
        this.featureToggleServiceV2 = featureToggleServiceV2;
        this.logger = config.getLogger('client-api/feature.js');
        this.get('/', this.getAll);
        this.get('/v2', this.getAllV2);
        this.get('/:featureName', this.getFeatureToggle);
        if (experimental && experimental.clientFeatureMemoize) {
            // @ts-ignore
            this.cache = experimental.clientFeatureMemoize.enabled;
            this.cachedFeatures = memoizee(
                (query, fields) =>
                    this.featureToggleService.getFeatures(query, fields),
                {
                    promise: true,
                    // @ts-ignore
                    maxAge: experimental.clientFeatureMemoize.maxAge,
                    normalizer(args) {
                        // args is arguments object as accessible in memoized function
                        return JSON.stringify(args[0]);
                    },
                },
            );
        }
    }

    async getAllV2(req: Request, res: Response): Promise<void> {
        try {
            const features = await this.featureToggleServiceV2.getClientFeatures();
            res.status(200).json({ version: 2, features });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            let features;
            if (this.cache) {
                features = await this.cachedFeatures(
                    req.query,
                    FEATURE_COLUMNS_CLIENT,
                );
            } else {
                features = await this.featureToggleService.getFeatures(
                    req.query,
                    FEATURE_COLUMNS_CLIENT,
                );
            }
            res.json({ version, features });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeatureToggle(
        req: Request<{ featureName: String }, any, any, any>,
        res: Response,
    ): Promise<void> {
        try {
            const name = req.params.featureName;
            const featureToggle = await this.featureToggleService.getFeature(
                name,
            );
            res.json(featureToggle).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }
}

module.exports = FeatureController;
