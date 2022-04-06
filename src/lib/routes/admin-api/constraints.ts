import { Request, Response } from 'express';
import FeatureToggleService from '../../services/feature-toggle-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { IConstraint } from '../../types/model';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { Logger } from '../../logger';

export default class ConstraintController extends Controller {
    private featureService: FeatureToggleService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
        }: Pick<IUnleashServices, 'featureToggleServiceV2'>,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.logger = config.getLogger('/admin-api/validation.ts');

        this.post('/validate', this.validateConstraint, NONE);
    }

    async validateConstraint(
        req: Request<{}, undefined, IConstraint>,
        res: Response,
    ): Promise<void> {
        await this.featureService.validateConstraint(req.body);
        res.status(204).send();
    }
}
