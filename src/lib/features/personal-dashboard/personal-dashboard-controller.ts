import { type IUnleashConfig, type IUnleashServices, NONE } from '../../types';
import type { OpenApiService } from '../../services';
import {
    createResponseSchema,
    getStandardResponses,
    personalDashboardSchema,
    type PersonalDashboardSchema,
} from '../../openapi';
import Controller from '../../routes/controller';
import type { Response } from 'express';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { PersonalDashboardService } from './personal-dashboard-service';

const PATH = '';

export default class PersonalDashboardController extends Controller {
    private openApiService: OpenApiService;

    private personalDashboardService: PersonalDashboardService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            personalDashboardService,
        }: Pick<
            IUnleashServices,
            'openApiService' | 'personalDashboardService'
        >,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.personalDashboardService = personalDashboardService;

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getPersonalDashboard,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get personal dashboard',
                    description:
                        'Return all projects and flags that are relevant to the user.',
                    operationId: 'getPersonalDashboard',
                    responses: {
                        200: createResponseSchema('personalDashboardSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getPersonalDashboard(
        req: IAuthRequest,
        res: Response<PersonalDashboardSchema>,
    ): Promise<void> {
        const user = req.user;

        const flags = await this.personalDashboardService.getPersonalFeatures(
            user.id,
        );

        const projects =
            await this.personalDashboardService.getPersonalProjects(user.id);

        this.openApiService.respondWithValidation(
            200,
            res,
            personalDashboardSchema.$id,
            { projects, flags },
        );
    }
}
