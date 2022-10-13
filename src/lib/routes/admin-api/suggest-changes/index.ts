import { Response, Request } from 'express';
import { IUnleashConfig, IUnleashServices } from '../../../types';
import { Logger } from '../../../logger';
import { ADMIN, NONE } from '../../../types/permissions';
import Controller from '../../controller';
import FeatureToggleService from 'lib/services/feature-toggle-service';
import { IAuthRequest } from '../../../server-impl';
import { extractUsername } from '../../../util/extract-user';

type Services = Pick<
    IUnleashServices,
    'settingService' | 'proxyService' | 'openApiService'
>;

const set = {
    id: '1312',
    environment: 'production',
    state: 'REVIEW',
    createdBy: 'Tymek',
    lastUpdatedAt: '2021-03-01T12:00:00.000Z',
    project: 'default',
    // approvers: [],
    // submittedBy: ??
    // changeAuthors ??
    changeSet: [
        {
            feature: 'feature1',
            // featureToggle: {
            //     //...state
            // },
            changes: [
                {
                    id: '123',
                    action: 'updateEnabled',
                    payload: true,
                    updatedBy: 'user1',
                    eventData: {},
                    createdAt: '2021-03-01T12:00:00.000Z',
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
                    id: '456',
                    action: 'updateEnabled',
                    payload: false,
                    updatedBy: 'user1',
                    eventData: {},
                    createdAt: '2022-09-30T16:34:00.000Z',
                },
            ],
        },
    ],
};

export default class SuggestChangesController extends Controller {
    private readonly logger: Logger;

    private services: Services;

    private featureToggleService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('proxy-api/index.ts');
        this.featureToggleService = featureToggleService;

        this.route({
            method: 'get',
            path: '/:changeRequestId',
            handler: this.getChangeRequest,
            permission: NONE,
        });

        this.route({
            method: 'post',
            path: '/:changeRequestId/approve',
            handler: this.approveChangeRequest,
            permission: ADMIN,
        });

        this.route({
            method: 'post',
            path: '/:changeRequestId/request-changes',
            handler: this.requestChanges,
            permission: ADMIN,
        });

        this.route({
            method: 'post',
            path: '/:changeRequestId/apply',
            handler: this.applyChangeRequest,
            permission: ADMIN,
        });
    }

    async createChangeRequest(req: Request, res: Response): Promise<void> {}

    async getChangeRequest(req: Request, res: Response): Promise<void> {
        res.json(set).end();
    }

    async approveChangeRequest(req: Request, res: Response): Promise<void> {
        set.state = 'APPROVED';
        res.status(200).end();
    }

    async requestChanges(req: Request, res: Response): Promise<void> {
        set.state = 'REQUEST_CHANGES';
        res.status(200).end();
    }

    async applyChangeRequest(
        req: IAuthRequest<any, any, any, any>,
        res: Response<void>,
    ): Promise<void> {
        if (set.state !== 'APPROVED') return;
        set.changeSet.forEach((toggle) => {
            toggle.changes.forEach((change) => {
                if (change.action === 'updateEnabled') {
                    this.featureToggleService.updateEnabled(
                        set.project,
                        toggle.feature,
                        set.environment,
                        change.payload,
                        extractUsername(req),
                        req.user,
                    );
                }
            });
        });

        set.state = 'APPLIED';
        res.status(200).end();
    }
}
