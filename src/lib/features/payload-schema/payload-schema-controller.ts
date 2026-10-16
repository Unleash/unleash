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
import type { UpsertPayloadSchemaSchema } from '../../openapi/index.js';
import type { PayloadSchemaService } from './payload-schema-service.js';

interface PayloadSchemaServices {
    openApiService: OpenApiService;
    payloadSchemaService: PayloadSchemaService;
}

interface PayloadSchemaParams {
    projectId: string;
    featureName: string;
}

const PATH = '/:projectId/features/:featureName/payload-schema';

export default class PayloadSchemaController extends Controller {
    private flagResolver: IFlagResolver;
    private payloadSchemaService: PayloadSchemaService;

    constructor(
        config: IUnleashConfig,
        { openApiService, payloadSchemaService }: PayloadSchemaServices,
    ) {
        super(config);
        this.flagResolver = config.flagResolver;
        this.payloadSchemaService = payloadSchemaService;

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

    async upsertPayloadSchema(
        req: Request<PayloadSchemaParams, unknown, UpsertPayloadSchemaSchema>,
        res: Response,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('payloadSchemas')) {
            throw new NotFoundError();
        }

        const { projectId, featureName } = req.params;
        await this.payloadSchemaService.upsertPayloadSchema({
            projectId,
            featureName,
            schema: req.body.schema,
        });

        res.status(204).end();
    }
}
