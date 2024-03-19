import type { Request, Response } from 'express';
import Controller from '../../routes/controller';

import { NONE } from '../../types/permissions';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { Logger } from '../../logger';

import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi';

const version = 1;

export class UiObservabilityController extends Controller {
    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/ui-observability.js');

        this.route({
            method: 'post',
            path: '',
            handler: this.recordUiError,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'uiObservability',
                    summary: 'Accepts errors from the UI client',
                    description:
                        'This endpoint accepts error reports from the UI client, so that we can add observability on UI errors.',
                    requestBody: createRequestSchema('recordUiErrorSchema'),
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async recordUiError(req: Request, res: Response): Promise<void> {
        this.logger.error(
            `UI Observability Error: ${req.body.errorMessage}`,
            req.body.errorStack,
        );

        res.status(204).end();
    }
}
