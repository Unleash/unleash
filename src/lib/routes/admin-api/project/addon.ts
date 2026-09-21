import type { Request, Response } from 'express';
import Controller from '../../controller.js';
import type { IUnleashConfig } from '../../../types/index.js';
import type AddonService from '../../../services/addon-service.js';
import type { IUnleashServices } from '../../../services/index.js';
import type { OpenApiService } from '../../../services/openapi-service.js';
import type { IProjectParam } from '../../../types/model.js';
import type { IAuthRequest } from '../../unleash-types.js';
import {
    CREATE_ADDON,
    NONE,
    UPDATE_ADDON,
    UPDATE_PROJECT_ADDON,
} from '../../../types/permissions.js';
import { createRequestSchema } from '../../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../../openapi/util/create-response-schema.js';
import { getStandardResponses } from '../../../openapi/util/standard-responses.js';
import { serializeDates } from '../../../types/serialize-dates.js';
import {
    type AddonSchema,
    addonSchema,
} from '../../../openapi/spec/addon-schema.js';
import {
    type AddonsSchema,
    addonsSchema,
} from '../../../openapi/spec/addons-schema.js';
import type { AddonCreateUpdateSchema } from '../../../openapi/spec/addon-create-update-schema.js';

type ProjectAddonServices = Pick<
    IUnleashServices,
    'addonService' | 'openApiService'
>;

const PATH = '/:projectId/addons';

export class ProjectAddonController extends Controller {
    private addonService: AddonService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { addonService, openApiService }: ProjectAddonServices,
    ) {
        super(config);
        this.addonService = addonService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getAddons,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all addons for a project',
                    description:
                        'Retrieve the addons that belong to this project, along with the providers that are available on this Unleash instance.',
                    tags: ['Addons'],
                    release: { beta: '8.2.0' },
                    operationId: 'getAddonsForProject',
                    responses: {
                        200: createResponseSchema('addonsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH,
            handler: this.createAddon,
            permission: [UPDATE_PROJECT_ADDON, CREATE_ADDON],
            middleware: [
                openApiService.validPath({
                    summary: 'Create a new addon for a project',
                    description:
                        'Create an addon instance belonging to this project. The addon must use one of the providers available on this Unleash instance.',
                    tags: ['Addons'],
                    release: { beta: '8.2.0' },
                    operationId: 'createAddonForProject',
                    requestBody: createRequestSchema('addonCreateUpdateSchema'),
                    responses: {
                        200: createResponseSchema('addonSchema'),
                        ...getStandardResponses(400, 401, 403, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: `${PATH}/:id`,
            handler: this.updateAddon,
            permission: [UPDATE_PROJECT_ADDON, UPDATE_ADDON],
            middleware: [
                openApiService.validPath({
                    summary: "Update one of a project's addons",
                    description: `Update the addon with a specific ID. Any fields in the update object will be updated. Properties that are not included in the update object will not be affected. To empty a property, pass \`null\` as that property's value.

Note: passing \`null\` as a value for the description property will set it to an empty string.`,
                    tags: ['Addons'],
                    release: { beta: '8.2.0' },
                    operationId: 'updateAddonForProject',
                    requestBody: createRequestSchema('addonCreateUpdateSchema'),
                    responses: {
                        200: createResponseSchema('addonSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 413, 415),
                    },
                }),
            ],
        });
    }

    async getAddons(
        req: Request<IProjectParam>,
        res: Response<AddonsSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { addons, providers } =
            await this.addonService.getAddonsOverview(projectId);

        this.openApiService.respondWithValidation(200, res, addonsSchema.$id, {
            addons: serializeDates(addons),
            providers: serializeDates(providers),
        });
    }

    async createAddon(
        req: IAuthRequest<IProjectParam, any, AddonCreateUpdateSchema, any>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const data = req.body;
        const addon = await this.addonService.createAddon(
            data,
            req.audit,
            projectId,
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async updateAddon(
        req: IAuthRequest<
            IProjectParam & { id: number },
            any,
            AddonCreateUpdateSchema,
            any
        >,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const { projectId, id } = req.params;
        const data = req.body;
        const addon = await this.addonService.updateAddon(
            id,
            data,
            req.audit,
            projectId,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }
}
