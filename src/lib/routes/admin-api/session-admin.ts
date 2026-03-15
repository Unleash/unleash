import type { Response } from 'express';
import Controller from '../controller.js';
import { ADMIN } from '../../types/permissions.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import { generateImageUrl } from '../../util/generateImageUrl.js';
import type SessionService from '../../services/session-service.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
} from '../../openapi/index.js';
import {
    adminSessionsSchema,
    type AdminSessionsSchema,
} from '../../openapi/spec/admin-sessions-schema.js';
import type { IAuthRequest } from '../unleash-types.js';
import { serializeDates } from '../../types/serialize-dates.js';

export class SessionAdminController extends Controller {
    private sessionService: SessionService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            sessionService,
            openApiService,
        }: Pick<IUnleashServices, 'sessionService' | 'openApiService'>,
    ) {
        super(config);
        this.sessionService = sessionService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getSessions,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'List all active sessions',
                    description:
                        'Returns all active sessions in the Unleash instance, including user information and IP address.',
                    operationId: 'getAdminSessions',
                    responses: {
                        200: createResponseSchema('adminSessionsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:id',
            handler: this.deleteSession,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Revoke a session',
                    description:
                        'Revokes the session with the given session ID.',
                    operationId: 'deleteAdminSession',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/user/:userId',
            handler: this.deleteSessionsForUser,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    summary: 'Revoke all sessions for a user',
                    description:
                        'Revokes all active sessions for the user with the given user ID.',
                    operationId: 'deleteAdminSessionsForUser',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getSessions(
        _req: IAuthRequest,
        res: Response<AdminSessionsSchema>,
    ): Promise<void> {
        const sessions =
            await this.sessionService.getActiveSessionsWithUserInfo();

        const enriched = sessions.map((session) => ({
            id: session.id,
            userId: session.sess?.user?.id ?? 0,
            userName: session.sess?.user?.name ?? null,
            userEmail: session.sess?.user?.email ?? null,
            imageUrl:
                session.imageUrl ??
                generateImageUrl({
                    email: session.sess?.user?.email,
                    username: session.sess?.user?.username,
                    id: session.sess?.user?.id,
                }),
            seenAt: session.seenAt ?? null,
            userAgent: session.sess?.userAgent ?? null,
            ipAddress: session.sess?.ip ?? null,
            createdAt: session.createdAt,
            expired: session.expired ?? null,
        }));

        this.openApiService.respondWithValidation(
            200,
            res,
            adminSessionsSchema.$id,
            serializeDates({ sessions: enriched }),
        );
    }

    async deleteSession(
        req: IAuthRequest<{ id: string }>,
        res: Response,
    ): Promise<void> {
        await this.sessionService.deleteSessionById(req.params.id);
        res.status(200).end();
    }

    async deleteSessionsForUser(
        req: IAuthRequest<{ userId: string }>,
        res: Response,
    ): Promise<void> {
        await this.sessionService.deleteSessionsForUser(
            Number(req.params.userId),
        );
        res.status(200).end();
    }
}
