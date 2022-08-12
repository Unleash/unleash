import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import AddonService from '../../services/addon-service';

import { extractUsername } from '../../util/extract-user';
import {
    CREATE_ADDON,
    DELETE_ADDON,
    NONE,
    UPDATE_ADDON,
} from '../../types/permissions';
import { IAuthRequest } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { OpenApiService } from '../../services/openapi-service';
import { AddonSchema, addonSchema } from '../../openapi/spec/addon-schema';
import { serializeDates } from '../../types/serialize-dates';
import { AddonsSchema, addonsSchema } from '../../openapi/spec/addons-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';

type AddonServices = Pick<IUnleashServices, 'addonService' | 'openApiService'>;

const PATH = '/';

class AddonController extends Controller {
    private logger: Logger;

    private addonService: AddonService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { addonService, openApiService }: AddonServices,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/addon.ts');
        this.addonService = addonService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            permission: NONE,
            handler: this.getAddons,
            middleware: [
                openApiService.validPath({
                    tags: ['Addons'],
                    operationId: 'getAddons',
                    responses: {
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
                    tags: ['Addons'],
                    operationId: 'createAddon',
                    requestBody: createRequestSchema('addonSchema'),
                    responses: { 200: createResponseSchema('addonSchema') },
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
                    tags: ['Addons'],
                    operationId: 'getAddon',
                    responses: { 200: createResponseSchema('addonSchema') },
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
                    tags: ['Addons'],
                    operationId: 'updateAddon',
                    requestBody: createRequestSchema('addonSchema'),
                    responses: { 200: createResponseSchema('addonSchema') },
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
                    tags: ['Addons'],
                    operationId: 'deleteAddon',
                    responses: { 200: emptyResponse },
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
        req: Request<{ id: number }, any, any, any>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const { id } = req.params;
        const addon = await this.addonService.getAddon(id);
        this.openApiService.respondWithValidation(
            200,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async updateAddon(
        req: IAuthRequest<{ id: number }, any, any, any>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const { id } = req.params;
        const createdBy = extractUsername(req);
        const data = req.body;

        const addon = await this.addonService.updateAddon(id, data, createdBy);

        this.openApiService.respondWithValidation(
            200,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async createAddon(
        req: IAuthRequest<AddonSchema, any, any, any>,
        res: Response<AddonSchema>,
    ): Promise<void> {
        const createdBy = extractUsername(req);
        const data = req.body;
        const addon = await this.addonService.createAddon(data, createdBy);

        this.openApiService.respondWithValidation(
            201,
            res,
            addonSchema.$id,
            serializeDates(addon),
        );
    }

    async deleteAddon(
        req: IAuthRequest<{ id: number }, any, any, any>,
        res: Response<void>,
    ): Promise<void> {
        const { id } = req.params;
        const username = extractUsername(req);
        await this.addonService.removeAddon(id, username);

        res.status(200).end();
    }
}
export default AddonController;
module.exports = AddonController;
