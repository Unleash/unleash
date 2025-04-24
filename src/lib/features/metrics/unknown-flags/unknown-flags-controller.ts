import type { Response } from 'express';
import {
    unknownFlagsResponseSchema,
    type UnknownFlagsResponseSchema,
} from '../../../openapi';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import Controller from '../../../routes/controller';
import type { IAuthRequest } from '../../../routes/unleash-types';
import type { OpenApiService } from '../../../services/openapi-service';
import type { IFlagResolver } from '../../../types/experimental';
import type { IUnleashConfig } from '../../../types/option';
import { NONE } from '../../../types/permissions';
import { serializeDates } from '../../../types/serialize-dates';
import type { IUnleashServices } from '../../../types/services';
import type { UnknownFlagsService } from './unknown-flags-service';

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
        req: IAuthRequest,
        res: Response<UnknownFlagsResponseSchema>,
    ): Promise<void> {
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
