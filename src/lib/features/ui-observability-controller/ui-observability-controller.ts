import { Request, Response } from 'express';
import Controller from '../../routes/controller';

import { NONE } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';

import { OpenApiService } from '../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';

const version = 1;

export class UiObservabilityController extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/tag-type.js');
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.recordError,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'uiObservability',
                    summary: 'Accepts errors from the UI client',
                    description:
                        'This endpoint accepts error reports from the UI client, so that we can add observability on UI errors.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async recordError(req: Request, res: Response): Promise<void> {
        // Record the error
    }
}
