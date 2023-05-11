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
import { patSchema } from '../../../openapi/spec/pat-schema';
import { PatsSchema, patsSchema } from '../../../openapi/spec/pats-schema';

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
                        'Get all Personal Access Tokens for the current user.',
                    description:
                        'Returns all of the [Personal Access Tokens](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens) belonging to the current user.',
                    responses: {
                        200: createResponseSchema('patsSchema'),
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
                    summary: 'Create a new Personal Access Token.',
                    description:
                        'Creates a new [Personal Access Token](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens) for the current user.',
                    requestBody: createRequestSchema('patSchema'),
                    responses: {
                        201: resourceCreatedResponseSchema('patSchema'),
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
                    summary: 'Delete a Personal Access Token.',
                    description:
                        'This endpoint allows for deleting a [Personal Access Token](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens) belonging to the current user.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async createPat(req: IAuthRequest, res: Response): Promise<void> {
        if (this.flagResolver.isEnabled('personalAccessTokensKillSwitch')) {
            res.status(404).send({ message: 'PAT is disabled' });
            return;
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
            res.status(404).send({ message: 'PAT is disabled' });
            return;
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
