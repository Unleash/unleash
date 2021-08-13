import { Request, Response } from 'express';
import { IUnleashConfig } from '../types/option';
import { IUnleashServices } from '../types/services';
import { Logger } from '../logger';
import HealthService from '../services/health-service';

const Controller = require('./controller');

class HealthCheckController extends Controller {
    private logger: Logger;

    private healthService: HealthService;

    constructor(
        config: IUnleashConfig,
        { healthService }: Pick<IUnleashServices, 'healthService'>,
    ) {
        super(config);
        this.logger = config.getLogger('health-check.js');
        this.healthService = healthService;
        this.get('/', (req, res) => this.index(req, res));
    }

    async index(req: Request, res: Response): Promise<void> {
        try {
            await this.healthService.dbIsUp();
            res.json({ health: 'GOOD' });
        } catch (e) {
            this.logger.error('Could not select from features, error was: ', e);
            res.status(500).json({ health: 'BAD' });
        }
    }
}
export default HealthCheckController;
module.exports = HealthCheckController;
