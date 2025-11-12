import type { Request, Response } from 'express';
import Controller from '../controller.js';
import type { IFlagResolver, IUnleashConfig } from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type AddonService from '../../services/addon-service.js';

import {
    ADMIN,
    CREATE_ADDON,
    DELETE_ADDON,
    NONE,
    UPDATE_ADDON,
} from '../../types/permissions.js';
import type { IAuthRequest } from '../unleash-types.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    type AddonSchema,
    addonSchema,
} from '../../openapi/spec/addon-schema.js';
import { serializeDates } from '../../types/serialize-dates.js';
import {
    type AddonsSchema,
    addonsSchema,
} from '../../openapi/spec/addons-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { AddonCreateUpdateSchema } from '../../openapi/spec/addon-create-update-schema.js';
import {
    type BasePaginationParameters,
    basePaginationParameters,
} from '../../openapi/spec/base-pagination-parameters.js';
import {
    type IntegrationEventsSchema,
    integrationEventsSchema,
} from '../../openapi/spec/integration-events-schema.js';
import { BadDataError } from '../../error/index.js';

import type {
    IntegrationEventsService,
    IUnleashServices,
} from '../../services/index.js';

type AddonServices = Pick<
    IUnleashServices,
    'addonService' | 'openApiService' | 'integrationEventsService'
>;

const PATH = '/';

class AddonController extends Controller {
    private logger: Logger;

    private addonService: AddonService;

    private openApiService: OpenApiService;

    private integrationEventsService: IntegrationEventsService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            addonService,
            openApiService,
            integrationEventsService,
        }: AddonServices,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/addon.ts');
        this.addonService = addonService;
        this.openApiService = openApiService;
        this.integrationEventsService = integrationEventsService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            permission: NONE,
            handler: this.getAddons,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all addons and providers',
                    description:
                        'Retrieve all addons and providers that are defined on this Unleash instance.',
                    tags: ['Addons'],
                    operationId: 'getAddons',
                    responses: {
                        ...getStandardResponses(401),
                        200: createResponseSchema('addonsSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createAddon,
            permission: CREATE_ADDON,
            middleware: [
                openApiService.validPath({
                    summary: 'Create a new addon',
                    description:
                        'Create an addon instance. The addon must use one of the providers available on this Unleash instance.',
                    tags: ['Addons'],
                    operationId: 'createAddon',
                    requestBody: createRequestSchema('addonCreateUpdateSchema'),
                    responses: {
                        200: createResponseSchema('addonSchema'),
                        ...getStandardResponses(400, 401, 403, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: `${PATH}:id`,
            handler: this.getAddon,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a specific addon',
                    description:
                        'Retrieve information about the addon whose ID matches the ID in the request URL.',
                    tags: ['Addons'],
                    operationId: 'getAddon',
                    responses: {
                        200: createResponseSchema('addonSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: `${PATH}:id`,
            handler: this.updateAddon,
            permission: UPDATE_ADDON,
            middleware: [
                openApiService.validPath({
                    summary: 'Update an addon',
                    description: `Update the addon with a specific ID. Any fields in the update object will be updated. Properties that are not included in the update object will not be affected. To empty a property, pass \`null\` as that property's value.

Note: passing \`null\` as a value for the description property will set it to an empty string.`,
                    tags: ['Addons'],
                    operationId: 'updateAddon',
                    requestBody: createRequestSchema('addonCreateUpdateSchema'),
                    responses: {
                        200: createResponseSchema('addonSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: `${PATH}:id`,
            handler: this.deleteAddon,
            acceptAnyContentType: true,
            permission: DELETE_ADDON,
            middleware: [
                openApiService.validPath({
                    summary: 'Delete an addon',
                    description:
                        'Delete the addon specified by the ID in the request path.',
                    tags: ['Addons'],
                    operationId: 'deleteAddon',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: `${PATH}:id/events`,
            handler: this.getIntegrationEvents,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Addons'],
                    operationId: 'getIntegrationEvents',
                    summary:
                        'Get integration events for a specific integration configuration.',
                    description:
                        'Returns a list of integration events belonging to a specific integration configuration, identified by its id.',
                    parameters: [...basePaginationParameters],
                    responses: {
                        ...getStandardResponses(401, 403, 404),
                        200: createResponseSchema(integrationEventsSchema.$id),
                    },
                }),
            ],
        });
    }

    async getAddons(req: Request, res: Response<AddonsSchema>): Promise<void> {
        const addons = await this.addonService.getAddons();
        const providers = this.addonService.getProviderDefinitions();

        this.openApiService.respondWithValidation(200, res, addonsSchema.$id, {
            addons: serializeDates(addons),
            providers: serializeDates(providers),
        });
    }

    async getAddon(
        req: Request<{ id: string }>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const { id } = req.params;
        const addon = await this.addonService.getAddon(Number(id));
        this.openApiService.respondWithValidation(
            200,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async updateAddon(
        req: IAuthRequest<{ id: string }, any, AddonCreateUpdateSchema>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const { id } = req.params;
        const data = req.body;

        const addon = await this.addonService.updateAddon(
            Number(id),
            data,
            req.audit,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async createAddon(
        req: IAuthRequest<{ id: string }, any, AddonCreateUpdateSchema>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const data = req.body;
        const addon = await this.addonService.createAddon(data, req.audit);

        this.openApiService.respondWithValidation(
            201,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async deleteAddon(
        req: IAuthRequest<{ id: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { id } = req.params;
        await this.addonService.removeAddon(Number(id), req.audit);

        res.status(200).end();
    }

    async getIntegrationEvents(
        req: IAuthRequest<
            { id: string },
            unknown,
            unknown,
            BasePaginationParameters
        >,
        res: Response<IntegrationEventsSchema>,
    ): Promise<void> {
        const { id } = req.params;

        if (Number.isNaN(Number(id))) {
            throw new BadDataError('Invalid integration configuration id');
        }

        const { limit = '50', offset = '0' } = req.query;

        const normalizedLimit =
            Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 50;
        const normalizedOffset = Number(offset) > 0 ? Number(offset) : 0;

        const integrationEvents =
            await this.integrationEventsService.getPaginatedEvents(
                Number(id),
                normalizedLimit,
                normalizedOffset,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            integrationEventsSchema.$id,
            {
                integrationEvents: serializeDates(integrationEvents),
            },
        );
    }
}
export default AddonController;
