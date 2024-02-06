import { Response } from 'express';
import Controller from '../../controller';
import { Logger } from '../../../logger';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../../types';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../../openapi/util/create-response-schema';
import { getStandardResponses } from '../../../openapi/util/standard-responses';
import { OpenApiService } from '../../../services/openapi-service';
import { emptyResponse } from '../../../openapi/util/standard-responses';

import PatService from '../../../services/pat-service';
import { NONE } from '../../../types/permissions';
import { IAuthRequest } from '../../unleash-types';
import { serializeDates } from '../../../types/serialize-dates';
import { PatSchema, patSchema } from '../../../openapi/spec/pat-schema';
import { PatsSchema, patsSchema } from '../../../openapi/spec/pats-schema';
import {
    CreatePatSchema,
    createPatSchema,
} from '../../../openapi/spec/create-pat-schema';
import { ForbiddenError, NotFoundError } from '../../../error';

export default class PatController extends Controller {
    private patService: PatService;

    private openApiService: OpenApiService;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            patService,
        }: Pick<IUnleashServices, 'openApiService' | 'patService'>,
    ) {
        super(config);
        this.logger = config.getLogger('lib/routes/auth/pat-controller.ts');
        this.flagResolver = config.flagResolver;
        this.openApiService = openApiService;
        this.patService = patService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getPats,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Personal access tokens'],
                    operationId: 'getPats',
                    summary:
                        'Get all personal access tokens (PATs) for the current user.',
                    description:
                        'Returns all of the [personal access tokens](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens) (PATs) belonging to the current user.',
                    responses: {
                        200: createResponseSchema(patsSchema.$id),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createPat,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Personal access tokens'],
                    operationId: 'createPat',
                    summary:
                        'Create a new personal access token (PAT) for the current user.',
                    description:
                        'Creates a new [personal access token](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens) (PAT) belonging to the current user.',
                    requestBody: createRequestSchema(createPatSchema.$id),
                    responses: {
                        201: resourceCreatedResponseSchema(patSchema.$id),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:id',
            acceptAnyContentType: true,
            handler: this.deletePat,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Personal access tokens'],
                    operationId: 'deletePat',
                    summary:
                        'Delete a personal access token (PAT) for the current user.',
                    description:
                        'Deletes a [personal access token](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens) (PAT) belonging to the current user.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async createPat(
        req: IAuthRequest<unknown, unknown, CreatePatSchema>,
        res: Response<PatSchema>,
    ): Promise<void> {
        if (this.flagResolver.isEnabled('personalAccessTokensKillSwitch')) {
            throw new NotFoundError('PATs are disabled.');
        }

        if (!req.user.id) {
            throw new ForbiddenError('PATs require an authenticated user.');
        }

        const pat = req.body;
        const createdPat = await this.patService.createPat(
            pat,
            req.user.id,
            req.user,
        );
        this.openApiService.respondWithValidation(
            201,
            res,
            patSchema.$id,
            serializeDates(createdPat),
        );
    }

    async getPats(req: IAuthRequest, res: Response<PatsSchema>): Promise<void> {
        if (this.flagResolver.isEnabled('personalAccessTokensKillSwitch')) {
            throw new NotFoundError('PATs are disabled.');
        }

        if (!req.user.id) {
            throw new ForbiddenError('PATs require an authenticated user.');
        }

        const pats = await this.patService.getAll(req.user.id);
        this.openApiService.respondWithValidation(200, res, patsSchema.$id, {
            pats: serializeDates(pats),
        });
    }

    async deletePat(
        req: IAuthRequest<{ id: number }>,
        res: Response,
    ): Promise<void> {
        const { id } = req.params;
        await this.patService.deletePat(id, req.user.id, req.user);
        res.status(200).end();
    }
}
