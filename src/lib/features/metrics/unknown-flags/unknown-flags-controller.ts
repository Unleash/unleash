import type { Response } from 'express';
import {
    unknownFlagsResponseSchema,
    type UnknownFlagsResponseSchema,
} from '../../../openapi/index.js';
import { createResponseSchema } from '../../../openapi/util/create-response-schema.js';
import Controller from '../../../routes/controller.js';
import type { IAuthRequest } from '../../../routes/unleash-types.js';
import type { OpenApiService } from '../../../services/openapi-service.js';
import type { IFlagResolver } from '../../../types/experimental.js';
import type { IUnleashConfig } from '../../../types/option.js';
import { NONE } from '../../../types/permissions.js';
import { serializeDates } from '../../../types/serialize-dates.js';
import type { IUnleashServices } from '../../../services/index.js';
import type { UnknownFlagsService } from './unknown-flags-service.js';
import { NotFoundError } from '../../../error/index.js';

export default class UnknownFlagsController extends Controller {
    private unknownFlagsService: UnknownFlagsService;

    private flagResolver: IFlagResolver;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            unknownFlagsService,
            openApiService,
        }: Pick<IUnleashServices, 'unknownFlagsService' | 'openApiService'>,
    ) {
        super(config);
        this.unknownFlagsService = unknownFlagsService;
        this.flagResolver = config.flagResolver;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUnknownFlags,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getUnknownFlags',
                    tags: ['Unstable'],
                    summary: 'Get latest reported unknown flag names',
                    description:
                        'Returns a list of unknown flag names reported in the last 24 hours, if any. Maximum of 10.',
                    responses: {
                        200: createResponseSchema('unknownFlagsResponseSchema'),
                    },
                }),
            ],
        });
    }

    async getUnknownFlags(
        _: IAuthRequest,
        res: Response<UnknownFlagsResponseSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('reportUnknownFlags')) {
            throw new NotFoundError();
        }
        const unknownFlags =
            await this.unknownFlagsService.getGroupedUnknownFlags();

        this.openApiService.respondWithValidation(
            200,
            res,
            unknownFlagsResponseSchema.$id,
            serializeDates({ unknownFlags }),
        );
    }
}
