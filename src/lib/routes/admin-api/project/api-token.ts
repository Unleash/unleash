import {
    ApiTokenSchema,
    apiTokenSchema,
    ApiTokensSchema,
    apiTokensSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    resourceCreatedResponseSchema,
} from '../../../openapi';
import { getStandardResponses } from '../../../openapi/util/standard-responses';
import User from '../../../types/user';
import {
    ADMIN,
    CREATE_PROJECT_API_TOKEN,
    DELETE_PROJECT_API_TOKEN,
    IUnleashConfig,
    IUnleashServices,
    READ_PROJECT_API_TOKEN,
    serializeDates,
} from '../../../types';
import { ApiTokenType, IApiToken } from '../../../types/models/api-token';
import {
    AccessService,
    ApiTokenService,
    OpenApiService,
    ProxyService,
} from '../../../services';
import { extractUsername } from '../../../util';
import { IAuthRequest } from '../../unleash-types';
import Controller from '../../controller';
import { Logger } from '../../../logger';
import { Response } from 'express';
import { timingSafeEqual } from 'crypto';
import { createApiToken } from '../../../schema/api-token-schema';
import { OperationDeniedError } from '../../../error';
import { tokenTypeToCreatePermission } from '../api-token';

interface ProjectTokenParam {
    token: string;
    projectId: string;
}

const PATH = '/:projectId/api-tokens';
const PATH_TOKEN = `${PATH}/:token`;
export class ProjectApiTokenController extends Controller {
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
        this.logger = config.getLogger('project-api-token-controller.js');

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getProjectApiTokens,
            permission: READ_PROJECT_API_TOKEN,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectApiTokens',
                    summary: 'Get api tokens for project.',
                    description:
                        'Returns the [project API tokens](https://docs.getunleash.io/how-to/how-to-create-project-api-tokens) that have been created for this project.',
                    responses: {
                        200: createResponseSchema('apiTokensSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH,
            handler: this.createProjectApiToken,
            permission: CREATE_PROJECT_API_TOKEN,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'createProjectApiToken',
                    requestBody: createRequestSchema('createApiTokenSchema'),
                    summary: 'Create a project API token.',
                    description:
                        'Endpoint that allows creation of [project API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys#api-token-visibility) for the specified project.',
                    responses: {
                        201: resourceCreatedResponseSchema('apiTokenSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: PATH_TOKEN,
            handler: this.deleteProjectApiToken,
            acceptAnyContentType: true,
            permission: DELETE_PROJECT_API_TOKEN,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'deleteProjectApiToken',
                    summary: 'Delete a project API token.',
                    description: `This operation deletes the API token specified in the request URL. If the token doesn't exist, returns an OK response (status code 200).`,
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getProjectApiTokens(
        req: IAuthRequest,
        res: Response<ApiTokensSchema>,
    ): Promise<void> {
        const { user } = req;
        const { projectId } = req.params;
        const projectTokens = await this.accessibleTokens(user, projectId);
        this.openApiService.respondWithValidation(
            200,
            res,
            apiTokensSchema.$id,
            { tokens: serializeDates(projectTokens) },
        );
    }

    async createProjectApiToken(
        req: IAuthRequest,
        res: Response<ApiTokenSchema>,
    ): Promise<any> {
        const createToken = await createApiToken.validateAsync(req.body);
        const { projectId } = req.params;
        const permissionRequired = tokenTypeToCreatePermission(
            createToken.type,
        );
        const hasPermission = await this.accessService.hasPermission(
            req.user,
            permissionRequired,
            projectId,
        );
        if (!hasPermission) {
            throw new OperationDeniedError(
                `You don't have the necessary access [${permissionRequired}] to perform this operation]`,
            );
        }
        if (!createToken.project) {
            createToken.project = projectId;
        }

        if (
            createToken.projects.length === 1 &&
            createToken.projects[0] === projectId
        ) {
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
            res.statusMessage =
                'Project level tokens can only be created for one project';
            res.status(400);
        }
    }

    async deleteProjectApiToken(
        req: IAuthRequest<ProjectTokenParam>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { projectId, token } = req.params;
        const storedToken = (await this.accessibleTokens(user, projectId)).find(
            (currentToken) => this.tokenEquals(currentToken.secret, token),
        );
        if (
            storedToken &&
            (storedToken.project === projectId ||
                (storedToken.projects.length === 1 &&
                    storedToken.project[0] === projectId))
        ) {
            await this.apiTokenService.delete(token, extractUsername(req));
            await this.proxyService.deleteClientForProxyToken(token);
            res.status(200).end();
        }
    }

    private tokenEquals(token1: string, token2: string) {
        return (
            token1.length === token2.length &&
            timingSafeEqual(Buffer.from(token1), Buffer.from(token2))
        );
    }

    private async accessibleTokens(
        user: User,
        project: string,
    ): Promise<IApiToken[]> {
        const allTokens = await this.apiTokenService.getAllTokens();

        if (user.isAPI && user.permissions.includes(ADMIN)) {
            return allTokens;
        }

        return allTokens.filter(
            (token) =>
                token.type !== ApiTokenType.ADMIN &&
                (token.project === project || token.projects.includes(project)),
        );
    }
}
