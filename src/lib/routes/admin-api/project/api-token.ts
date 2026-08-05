import {
    type ApiTokenSchema,
    apiTokenSchema,
    type ApiTokensSchema,
    apiTokensSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    resourceCreatedResponseSchema,
} from '../../../openapi/index.js';
import { getStandardResponses } from '../../../openapi/util/standard-responses.js';
import type { IUser } from '../../../types/user.js';
import {
    ADMIN,
    CREATE_PROJECT_API_TOKEN,
    DELETE_PROJECT_API_TOKEN,
    type IUnleashConfig,
    READ_PROJECT_API_TOKEN,
    serializeDates,
} from '../../../types/index.js';
import { ApiTokenType, type IApiToken } from '../../../types/model.js';
import type {
    AccessService,
    ApiTokenService,
    OpenApiService,
    ProjectService,
    FrontendApiService,
    IUnleashServices,
} from '../../../services/index.js';
import { parseApiTokenV2Identifier } from '../../../authentication/authorization-token.js';
import type { ApiTokenV2Service } from '../../../features/apitokensv2/index.js';
import type { IAuthRequest } from '../../unleash-types.js';
import Controller from '../../controller.js';
import type { Response } from 'express';
import { timingSafeEqual } from 'crypto';
import { OperationDeniedError } from '../../../error/index.js';
import type { CreateProjectApiTokenSchema } from '../../../openapi/spec/create-project-api-token-schema.js';
import { createProjectApiToken } from '../../../schema/create-project-api-token-schema.js';

interface ProjectTokenParam {
    token: string;
    projectId: string;
}

const PATH = '/:projectId/api-tokens';
const PATH_TOKEN = `${PATH}/:token`;
export class ProjectApiTokenController extends Controller {
    private apiTokenService: ApiTokenService;

    private apiTokenV2Service: ApiTokenV2Service;

    private accessService: AccessService;

    private frontendApiService: FrontendApiService;

    private openApiService: OpenApiService;

    private projectService: ProjectService;

    constructor(
        config: IUnleashConfig,
        {
            apiTokenService,
            apiTokenV2Service,
            accessService,
            frontendApiService,
            openApiService,
            projectService,
        }: Pick<
            IUnleashServices,
            | 'apiTokenService'
            | 'apiTokenV2Service'
            | 'accessService'
            | 'frontendApiService'
            | 'openApiService'
            | 'projectService'
        >,
    ) {
        super(config);
        this.apiTokenService = apiTokenService;
        this.apiTokenV2Service = apiTokenV2Service;
        this.accessService = accessService;
        this.frontendApiService = frontendApiService;
        this.openApiService = openApiService;
        this.projectService = projectService;

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getProjectApiTokens,
            permission: READ_PROJECT_API_TOKEN,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    release: { stable: '4.21.0' },
                    operationId: 'getProjectApiTokens',
                    summary: 'Get api tokens for project.',
                    description:
                        'Returns the project-specific [API tokens](https://docs.getunleash.io/concepts/api-tokens-and-client-keys) that have been created for this project.',
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
                    release: { stable: '4.21.0' },
                    operationId: 'createProjectApiToken',
                    requestBody: createRequestSchema(
                        'createProjectApiTokenSchema',
                    ),
                    summary: 'Create a project API token.',
                    description:
                        'Endpoint that allows creation of [project API tokens](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#api-token-visibility) for the specified project.',
                    responses: {
                        201: resourceCreatedResponseSchema('apiTokenSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
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
                    release: { stable: '4.21.0' },
                    operationId: 'deleteProjectApiToken',
                    summary: 'Delete a project API token.',
                    description: `This operation deletes the API token specified in the request URL. If the token doesn't exist, returns an OK response (status code 200).`,
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404),
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

        const _project = await this.projectService.getProject(projectId); // Validates that the project exists
        const projectTokens = await this.accessibleTokens(user, projectId);
        this.openApiService.respondWithValidation(
            200,
            res,
            apiTokensSchema.$id,
            { tokens: serializeDates(projectTokens) },
        );
    }

    async createProjectApiToken(
        req: IAuthRequest<{ projectId: string }, CreateProjectApiTokenSchema>,
        res: Response<ApiTokenSchema>,
    ): Promise<any> {
        const createToken = await createProjectApiToken.validateAsync(req.body);
        const { projectId } = req.params;
        await this.projectService.getProject(projectId); // Validates that the project exists

        const permissionRequired = CREATE_PROJECT_API_TOKEN;
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
        const tokenData = { ...createToken, projects: [projectId] };
        let token: IApiToken;
        if (this.config.flagResolver.isEnabled('secureTokenStorage')) {
            const tokenV2 = await this.apiTokenV2Service.create(
                { ...tokenData, userCreated: true },
                req.audit,
            );
            const { selector: _selector, ...tokenWithSecret } = tokenV2;
            token = {
                ...tokenWithSecret,
                project: tokenV2.projects.join(','),
            };
        } else {
            token = await this.apiTokenService.createApiTokenWithProjects(
                tokenData,
                req.audit,
            );
        }
        this.openApiService.respondWithValidation(
            201,
            res,
            apiTokenSchema.$id,
            serializeDates(token),
            { location: `api-tokens` },
        );
    }

    async deleteProjectApiToken(
        req: IAuthRequest<ProjectTokenParam>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { projectId, token } = req.params;
        const v2Identifier = parseApiTokenV2Identifier(token);
        const storedToken = (await this.accessibleTokens(user, projectId)).find(
            (currentToken) =>
                this.tokenEquals(
                    currentToken.secret,
                    v2Identifier?.selector ?? token,
                ),
        );
        if (
            storedToken &&
            (storedToken.project === projectId ||
                (storedToken.projects.length === 1 &&
                    storedToken.projects[0] === projectId))
        ) {
            if (v2Identifier) {
                await this.apiTokenV2Service.delete(v2Identifier, req.audit);
            } else {
                await this.apiTokenService.delete(token, req.audit);
            }
            await this.frontendApiService.deleteClientForFrontendApiToken(
                v2Identifier?.selector ?? token,
            );
            res.status(200).end();
        } else if (!storedToken) {
            res.status(404).end();
        } else {
            res.status(400).end();
        }
    }

    private tokenEquals(token1: string, token2: string) {
        return (
            token1.length === token2.length &&
            timingSafeEqual(Buffer.from(token1), Buffer.from(token2))
        );
    }

    private async accessibleTokens(
        user: IUser,
        project: string,
    ): Promise<IApiToken[]> {
        const allTokens = (
            await Promise.all([
                this.apiTokenService.getUserDefinedTokens(),
                this.apiTokenV2Service.getUserDefinedTokens(),
            ])
        ).flat();

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
