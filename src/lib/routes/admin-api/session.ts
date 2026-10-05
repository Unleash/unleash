import type { Response } from 'express';
import Controller from '../controller.js';
import type { IAuthRequest } from '../unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { NONE } from '../../types/permissions.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import { sessionKeepAliveSchema } from '../../openapi/spec/session-keep-alive-schema.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';

export default class SessionController extends Controller {
    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '/keep-alive',
            handler: this.keepAlive,
            permission: NONE,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    release: { alpha: true },
                    operationId: 'keepSessionAlive',
                    summary: 'Report that the user is still active',
                    description:
                        "Renews the calling session's idle window. Only has an effect on instances with `SESSION_IDLE_TIMEOUT_MINUTES` set and the `sessionTimeouts` flag on.",
                    responses: {
                        200: createResponseSchema(sessionKeepAliveSchema.$id),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });
    }

    async keepAlive(_req: IAuthRequest, res: Response): Promise<void> {
        const { sessionExpiresInMs } = res.locals;

        this.openApiService.respondWithValidation(
            200,
            res,
            sessionKeepAliveSchema.$id,
            typeof sessionExpiresInMs === 'number'
                ? { expiresInMs: sessionExpiresInMs }
                : {},
        );
    }
}
