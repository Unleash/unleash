import { Response, Request } from 'express';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../../logger';
import { NONE } from '../../../types/permissions';
import Controller from '../../controller';
import { restore } from 'nock/types';

type Services = Pick<
    IUnleashServices,
    'settingService' | 'proxyService' | 'openApiService'
>;

export default class SuggestChangesController extends Controller {
    private readonly logger: Logger;

    private services: Services;

    constructor(config: IUnleashConfig, services: Services) {
        super(config);
        this.logger = config.getLogger('proxy-api/index.ts');
        this.services = services;

        this.route({
            method: 'get',
            path: '/:changeRequestId',
            handler: this.getChangeRequest,
            permission: NONE,
        });
    }

    async createChangeRequest(req: Request, res: Response): Promise<void> {}

    async getChangeRequest(req: Request, res: Response): Promise<void> {
        res.json({
            environment: 'production',
            state: 'REVIEW',
            createdBy: 'Tymek',
            project: 'new-project',
            // approvers: [],
            changeSet: [
                {
                    feature: 'feature1',
                    // featureToggle: {
                    //     //...state
                    // },
                    changes: [
                        {
                            action: 'updateEnabled',
                            payload: true,
                            updatedBy: 'user1',
                            eventData: {},
                        },
                    ],
                },
                {
                    feature: 'feature2',
                    // featureToggle: {
                    //     //...state
                    // },
                    changes: [
                        {
                            action: 'updateEnabled',
                            payload: true,
                            updatedBy: 'user1',
                            eventData: {},
                        },
                    ],
                },
            ],
        });
    }

    async approveChangeRequest(req: Request, res: Response): Promise<void> {}

    async applyChangeRequest(req: Request, res: Response): Promise<void> {}
}
