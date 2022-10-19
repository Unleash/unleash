import { Response } from 'express';
import Controller from '../../controller';
import { Logger } from '../../../logger';
import { IUnleashConfig, IUnleashServices } from '../../../types';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import { OpenApiService } from '../../../services/openapi-service';
import { emptyResponse } from '../../../openapi/util/standard-responses';

import AchievementsService from '../../../services/achievements-service';
import { NONE } from '../../../types/permissions';
import { IAuthRequest } from '../../unleash-types';
import { serializeDates } from '../../../types/serialize-dates';
import {
    AchievementsSchema,
    achievementsSchema,
} from '../../../openapi/spec/achievements-schema';
import {
    AchievementSchema,
    achievementSchema,
} from '../../../openapi/spec/achievement-schema';

export default class AchievementsController extends Controller {
    private achievementsService: AchievementsService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            achievementsService,
        }: Pick<IUnleashServices, 'openApiService' | 'achievementsService'>,
    ) {
        super(config);
        this.logger = config.getLogger(
            'lib/routes/auth/achievements-controller.ts',
        );
        this.openApiService = openApiService;
        this.achievementsService = achievementsService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getAchievements,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Achievements'],
                    operationId: 'getAchievements',
                    responses: {
                        200: createResponseSchema('achievementsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.unlockAchievement,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Achievements'],
                    operationId: 'unlockAchievement',
                    responses: {
                        201: createResponseSchema('achievementSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '',
            handler: this.markAchievementSeen,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Achievements'],
                    operationId: 'markAchievementSeen',
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async getAchievements(
        req: IAuthRequest,
        res: Response<AchievementsSchema>,
    ): Promise<void> {
        const achievements = await this.achievementsService.getAll(req.user);
        this.openApiService.respondWithValidation(
            200,
            res,
            achievementsSchema.$id,
            {
                achievements: serializeDates(achievements),
            },
        );
    }

    async unlockAchievement(
        req: IAuthRequest,
        res: Response<AchievementSchema>,
    ): Promise<void> {
        const { id } = req.body;
        const newAchievement = await this.achievementsService.unlockAchievement(
            id,
            req.user,
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            achievementSchema.$id,
            serializeDates(newAchievement),
        );
    }

    async markAchievementSeen(req: IAuthRequest, res: Response): Promise<void> {
        const { id } = req.body;
        await this.achievementsService.markAchievementSeen(id, req.user);
        res.status(200).end();
    }
}
