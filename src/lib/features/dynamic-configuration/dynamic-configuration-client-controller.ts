import type { Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import hashSum from 'hash-sum';
import Controller from '../../routes/controller.js';
import type { IApiRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/index.js';
import { ApiTokenType } from '../../types/model.js';
import { NONE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import { ForbiddenError } from '../../error/index.js';
import { isAllProjects } from '../../types/models/api-token.js';
import { clientDynamicConfigurationsSchema } from '../../openapi/spec/client-dynamic-configurations-schema.js';
import { compileDynamicConfiguration } from './compile-dynamic-configuration.js';
import { mockDynamicConfigurationStore } from './mock-dynamic-configuration-store.js';
import type { CompiledDynamicConfiguration } from './dynamic-configuration-types.js';

interface DynamicConfigurationQuery {
    namePrefix?: string;
}

interface ClientDynamicConfigurationsResponse {
    formatVersion: number;
    configurations: CompiledDynamicConfiguration[];
    meta: {
        revisionId: number;
        etag: string;
        generatedAt: string;
    };
}

export class DynamicConfigurationClientController extends Controller {
    private readonly openApiService: OpenApiService;

    constructor(config: IUnleashConfig, openApiService: OpenApiService) {
        super(config);
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getAll,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getClientDynamicConfigurations',
                    tags: ['Client'],
                    summary: 'Get dynamic configurations for local evaluation',
                    description:
                        'Returns a configuration-native document with Yggdrasil-like expression payloads. This alpha mock accepts backend API tokens only.',
                    release: { alpha: true },
                    parameters: [
                        {
                            name: 'namePrefix',
                            in: 'query',
                            required: false,
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        200: createResponseSchema(
                            'clientDynamicConfigurationsSchema',
                        ),
                        304: { description: 'Configuration is unchanged.' },
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getAll(
        req: IApiRequest<
            Record<string, never>,
            ClientDynamicConfigurationsResponse,
            never,
            DynamicConfigurationQuery
        >,
        res: Response<ClientDynamicConfigurationsResponse>,
    ): Promise<void> {
        if (
            req.user.type !== ApiTokenType.CLIENT &&
            req.user.type !== ApiTokenType.BACKEND
        ) {
            throw new ForbiddenError(
                'Dynamic configuration requires a backend API token.',
            );
        }

        const projects = isAllProjects(req.user.projects)
            ? ['default']
            : req.user.projects;
        const environment = req.user.environment;
        const namePrefix = req.query.namePrefix;
        const revisionId = mockDynamicConfigurationStore.getRevision();
        const queryHash = hashSum({
            projects,
            environment,
            namePrefix,
        });
        const etag = `"${queryHash}:${revisionId}:v1"`;

        res.setHeader('ETag', etag);
        if (req.headers['if-none-match'] === etag) {
            res.status(304).end();
            return;
        }

        const configurations = projects
            .flatMap((project) => mockDynamicConfigurationStore.list(project))
            .filter(
                (configuration) =>
                    !namePrefix || configuration.key.startsWith(namePrefix),
            )
            .map((configuration) =>
                compileDynamicConfiguration(configuration, environment),
            )
            .filter(
                (
                    configuration,
                ): configuration is CompiledDynamicConfiguration =>
                    configuration !== undefined,
            );

        const response: ClientDynamicConfigurationsResponse = {
            formatVersion: 1,
            configurations,
            meta: {
                revisionId,
                etag,
                generatedAt: new Date().toISOString(),
            },
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            clientDynamicConfigurationsSchema.$id,
            response,
        );
    }
}
