import type { Request, Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IFlagResolver } from '../../types/index.js';
import { UPDATE_FEATURE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { NotFoundError } from '../../error/index.js';

interface PayloadSchemaServices {
    openApiService: OpenApiService;
}

const PATH = '/:projectId/features/:featureName/payload-schema';

export default class PayloadSchemaController extends Controller {
    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        { openApiService }: PayloadSchemaServices,
    ) {
        super(config);
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'put',
            path: PATH,
            handler: this.upsertPayloadSchema,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    release: { alpha: true },
                    operationId: 'upsertFeaturePayloadSchema',
                    summary: 'Set the payload schema of a feature flag',
                    description:
                        'Sets the schema that the variant payloads of the feature flag have to match. A flag has at most one payload schema, so this replaces the one it already has.',
                    requestBody: createRequestSchema(
                        'upsertPayloadSchemaSchema',
                    ),
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });
    }

    async upsertPayloadSchema(_req: Request, res: Response): Promise<void> {
        if (!this.flagResolver.isEnabled('payloadSchemas')) {
            throw new NotFoundError();
        }

        res.status(204).end();
    }
}
