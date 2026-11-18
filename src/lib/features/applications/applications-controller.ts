import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IAuthRequest,
    type IUnleashConfig,
    serializeDates,
    UPDATE_APPLICATION,
} from '../../types/index.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { WithTransactional } from '../../db/transaction.js';
import type { ApplicationService } from './application-service.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { resourceCreatedResponseSchema } from '../../openapi/util/create-response-schema.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import {
    applicationCreatedSchema,
    type ApplicationCreatedSchema,
} from '../../openapi/spec/application-created-schema.js';
import type { CreateApplicationRequestSchema } from '../../openapi/spec/create-application-request-schema.js';
import NotFoundError from '../../error/notfound-error.js';

export class ApplicationsController extends Controller {
    private transactionalApplicationService: WithTransactional<ApplicationService>;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            transactionalApplicationService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'transactionalApplicationService' | 'openApiService'
        >,
    ) {
        super(config);
        this.transactionalApplicationService = transactionalApplicationService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.createApplication,
            permission: UPDATE_APPLICATION,
            middleware: [
                openApiService.validPath({
                    tags: ['Metrics'],
                    release: { alpha: true },
                    operationId: 'createExplicitApplication',
                    summary: 'Create an application',
                    description:
                        'Creates an application before any SDK reports it, so tokens can be linked to it. Returns 409 if an application with this name already exists.',
                    requestBody: createRequestSchema(
                        'createApplicationRequestSchema',
                    ),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'applicationCreatedSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 404, 409, 415),
                    },
                }),
            ],
        });
    }

    async createApplication(
        req: IAuthRequest<unknown, unknown, CreateApplicationRequestSchema>,
        res: Response<ApplicationCreatedSchema>,
    ): Promise<void> {
        if (!this.config.flagResolver.isEnabled('applicationOverview')) {
            throw new NotFoundError();
        }
        const application =
            await this.transactionalApplicationService.transactional(
                (service) =>
                    service.create(
                        {
                            appName: req.body.appName,
                            description: req.body.description,
                        },
                        req.audit,
                    ),
            );
        this.openApiService.respondWithValidation(
            201,
            res,
            applicationCreatedSchema.$id,
            serializeDates({
                appName: application.appName,
                description: application.description ?? null,
                createdAt: application.createdAt,
            }),
            {
                location: `metrics/applications/${encodeURIComponent(application.appName)}`,
            },
        );
    }
}
