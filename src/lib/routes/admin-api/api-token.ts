import { Response } from 'express';

import Controller from '../controller';
import {
    ADMIN,
    CREATE_CLIENT_API_TOKEN,
    CREATE_FRONTEND_API_TOKEN,
    DELETE_CLIENT_API_TOKEN,
    DELETE_FRONTEND_API_TOKEN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    UPDATE_CLIENT_API_TOKEN,
    UPDATE_FRONTEND_API_TOKEN,
} from '../../types/permissions';
import { ApiTokenService } from '../../services/api-token-service';
import { Logger } from '../../logger';
import { AccessService } from '../../services/access-service';
import { IAuthRequest } from '../unleash-types';
import User from '../../types/user';
import { IUnleashConfig } from '../../types/option';
import { ApiTokenType, IApiToken } from '../../types/models/api-token';
import { createApiToken } from '../../schema/api-token-schema';
import { OpenApiService } from '../../services/openapi-service';
import { IUnleashServices } from '../../types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import {
    apiTokensSchema,
    ApiTokensSchema,
} from '../../openapi/spec/api-tokens-schema';
import { serializeDates } from '../../types/serialize-dates';
import {
    apiTokenSchema,
    ApiTokenSchema,
} from '../../openapi/spec/api-token-schema';
import { UpdateApiTokenSchema } from '../../openapi/spec/update-api-token-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { ProxyService } from '../../services/proxy-service';
import { extractUsername } from '../../util';
import { OperationDeniedError } from '../../error';

interface TokenParam {
    token: string;
}
export const tokenTypeToCreatePermission: (
    tokenType: ApiTokenType,
) => string = (tokenType) => {
    switch (tokenType) {
        case ApiTokenType.ADMIN:
            return ADMIN;
        case ApiTokenType.CLIENT:
            return CREATE_CLIENT_API_TOKEN;
        case ApiTokenType.FRONTEND:
            return CREATE_FRONTEND_API_TOKEN;
    }
};

const permissionToTokenType: (
    permission: string,
) => ApiTokenType | undefined = (permission) => {
    if (
        [
            CREATE_FRONTEND_API_TOKEN,
            READ_FRONTEND_API_TOKEN,
            DELETE_FRONTEND_API_TOKEN,
            UPDATE_FRONTEND_API_TOKEN,
        ].includes(permission)
    ) {
        return ApiTokenType.FRONTEND;
    } else if (
        [
            CREATE_CLIENT_API_TOKEN,
            READ_CLIENT_API_TOKEN,
            DELETE_CLIENT_API_TOKEN,
            UPDATE_CLIENT_API_TOKEN,
        ].includes(permission)
    ) {
        return ApiTokenType.CLIENT;
    } else if (ADMIN === permission) {
        return ApiTokenType.ADMIN;
    } else {
        return undefined;
    }
};

const tokenTypeToUpdatePermission: (tokenType: ApiTokenType) => string = (
    tokenType,
) => {
    switch (tokenType) {
        case ApiTokenType.ADMIN:
            return ADMIN;
        case ApiTokenType.CLIENT:
            return UPDATE_CLIENT_API_TOKEN;
        case ApiTokenType.FRONTEND:
            return UPDATE_FRONTEND_API_TOKEN;
    }
};

const tokenTypeToDeletePermission: (tokenType: ApiTokenType) => string = (
    tokenType,
) => {
    switch (tokenType) {
        case ApiTokenType.ADMIN:
            return ADMIN;
        case ApiTokenType.CLIENT:
            return DELETE_CLIENT_API_TOKEN;
        case ApiTokenType.FRONTEND:
            return DELETE_FRONTEND_API_TOKEN;
    }
};

export class ApiTokenController extends Controller {
    private apiTokenService: ApiTokenService;

    private accessService: AccessService;

    private proxyService: ProxyService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            apiTokenService,
            accessService,
            proxyService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'apiTokenService'
            | 'accessService'
            | 'proxyService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.apiTokenService = apiTokenService;
        this.accessService = accessService;
        this.proxyService = proxyService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('api-token-controller.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllApiTokens,
            permission: [ADMIN, READ_CLIENT_API_TOKEN, READ_FRONTEND_API_TOKEN],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'getAllApiTokens',
                    responses: {
                        200: createResponseSchema('apiTokensSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createApiToken,
            permission: [
                ADMIN,
                CREATE_CLIENT_API_TOKEN,
                CREATE_FRONTEND_API_TOKEN,
            ],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'createApiToken',
                    requestBody: createRequestSchema('createApiTokenSchema'),
                    responses: {
                        201: resourceCreatedResponseSchema('apiTokenSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:token',
            handler: this.updateApiToken,
            permission: [
                ADMIN,
                UPDATE_CLIENT_API_TOKEN,
                UPDATE_FRONTEND_API_TOKEN,
            ],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'updateApiToken',
                    requestBody: createRequestSchema('updateApiTokenSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:token',
            handler: this.deleteApiToken,
            acceptAnyContentType: true,
            permission: [
                ADMIN,
                DELETE_CLIENT_API_TOKEN,
                DELETE_FRONTEND_API_TOKEN,
            ],
            middleware: [
                openApiService.validPath({
                    tags: ['API tokens'],
                    operationId: 'deleteApiToken',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getAllApiTokens(
        req: IAuthRequest,
        res: Response<ApiTokensSchema>,
    ): Promise<void> {
        const { user } = req;
        const tokens = await this.accessibleTokens(user);
        this.openApiService.respondWithValidation(
            200,
            res,
            apiTokensSchema.$id,
            { tokens: serializeDates(tokens) },
        );
    }

    async createApiToken(
        req: IAuthRequest,
        res: Response<ApiTokenSchema>,
    ): Promise<any> {
        const createToken = await createApiToken.validateAsync(req.body);
        const permissionRequired = tokenTypeToCreatePermission(
            createToken.type,
        );
        const hasPermission = await this.accessService.hasPermission(
            req.user,
            permissionRequired,
        );
        if (hasPermission) {
            const token = await this.apiTokenService.createApiToken(
                createToken,
                extractUsername(req),
            );
            this.openApiService.respondWithValidation(
                201,
                res,
                apiTokenSchema.$id,
                serializeDates(token),
                { location: `api-tokens` },
            );
        } else {
            throw new OperationDeniedError(
                `You don't have the necessary access [${permissionRequired}] to perform this operation`,
            );
        }
    }

    async updateApiToken(
        req: IAuthRequest<TokenParam, void, UpdateApiTokenSchema>,
        res: Response,
    ): Promise<any> {
        const { token } = req.params;
        const { expiresAt } = req.body;

        if (!expiresAt) {
            this.logger.error(req.body);
            return res.status(400).send();
        }
        let tokenToUpdate;
        try {
            tokenToUpdate = await this.apiTokenService.getToken(token);
        } catch (error) {}
        if (!tokenToUpdate) {
            res.status(200).end();
            return;
        }
        const permissionRequired = tokenTypeToUpdatePermission(
            tokenToUpdate.type,
        );
        const hasPermission = await this.accessService.hasPermission(
            req.user,
            permissionRequired,
        );
        if (!hasPermission) {
            throw new OperationDeniedError(
                `You do not have the required access [${permissionRequired}] to perform this operation`,
            );
        }

        await this.apiTokenService.updateExpiry(
            token,
            new Date(expiresAt),
            extractUsername(req),
        );

        return res.status(200).end();
    }

    async deleteApiToken(
        req: IAuthRequest<TokenParam>,
        res: Response,
    ): Promise<void> {
        const { token } = req.params;
        let tokenToUpdate;
        try {
            tokenToUpdate = await this.apiTokenService.getToken(token);
        } catch (error) {}
        if (!tokenToUpdate) {
            res.status(200).end();
            return;
        }
        const permissionRequired = tokenTypeToDeletePermission(
            tokenToUpdate.type,
        );
        let hasPermission = await this.accessService.hasPermission(
            req.user,
            permissionRequired,
        );
        if (!hasPermission) {
            throw new OperationDeniedError(
                `You do not have the required access [${permissionRequired}] to perform this operation`,
            );
        }
        await this.apiTokenService.delete(token, extractUsername(req));
        await this.proxyService.deleteClientForProxyToken(token);
        res.status(200).end();
    }

    private async accessibleTokens(user: User): Promise<IApiToken[]> {
        const allTokens = await this.apiTokenService.getAllTokens();

        if (user.isAPI && user.permissions.includes(ADMIN)) {
            return allTokens;
        }
        const userPermissions = await this.accessService.getPermissionsForUser(
            user,
        );

        const allowedTokenTypes = [
            ADMIN,
            READ_CLIENT_API_TOKEN,
            READ_FRONTEND_API_TOKEN,
        ]
            .filter((readPerm) =>
                userPermissions.some(
                    (p) => p.permission === readPerm || p.permission === ADMIN,
                ),
            )
            .map(permissionToTokenType)
            .filter((t) => t);
        return allTokens.filter((token) =>
            allowedTokenTypes.includes(token.type),
        );
    }
}
