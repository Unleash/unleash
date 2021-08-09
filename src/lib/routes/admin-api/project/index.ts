import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import ProjectHealthReport from './health-report';

export default class ProjectApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.use('/', new ProjectHealthReport(config, services).router);
    }
}
