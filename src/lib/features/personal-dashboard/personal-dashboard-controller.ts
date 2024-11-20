import {
    type IUnleashConfig,
    type IUnleashServices,
    NONE,
    serializeDates,
} from '../../types';
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
import {
    personalDashboardProjectDetailsSchema,
    type PersonalDashboardProjectDetailsSchema,
} from '../../openapi/spec/personal-dashboard-project-details-schema';

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
            path: '',
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

        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getPersonalDashboardProjectDetails,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get personal project details',
                    description:
                        'Return personal dashboard project events, owners, user roles and onboarding status',
                    operationId: 'getPersonalDashboardProjectDetails',
                    responses: {
                        200: createResponseSchema(
                            'personalDashboardProjectDetailsSchema',
                        ),
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

        const [flags, projects, projectOwners, admins] = await Promise.all([
            this.personalDashboardService.getPersonalFeatures(user.id),
            this.personalDashboardService.getPersonalProjects(user.id),
            this.personalDashboardService.getProjectOwners(user.id),
            this.personalDashboardService.getAdmins(),
        ]);

        this.openApiService.respondWithValidation(
            200,
            res,
            personalDashboardSchema.$id,
            { projects, flags, projectOwners, admins },
        );
    }

    async getPersonalDashboardProjectDetails(
        req: IAuthRequest<{ projectId: string }>,
        res: Response<PersonalDashboardProjectDetailsSchema>,
    ): Promise<void> {
        const user = req.user;

        const projectDetails =
            await this.personalDashboardService.getPersonalProjectDetails(
                user.id,
                req.params.projectId,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            personalDashboardProjectDetailsSchema.$id,
            serializeDates({
                ...projectDetails,
            }),
        );
    }
}
