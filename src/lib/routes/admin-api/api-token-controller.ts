import { Response } from 'express';

import Controller from '../controller';
import {
    ADMIN,
    CREATE_API_TOKEN,
    DELETE_API_TOKEN,
    READ_API_TOKEN,
    UPDATE_API_TOKEN,
} from '../../types/permissions';
import { ApiTokenService } from '../../services/api-token-service';
import { Logger } from '../../logger';
import { AccessService } from '../../services/access-service';
import { IAuthRequest } from '../unleash-types';
import User from '../../types/user';
import { IUnleashConfig } from '../../types/option';
import { ApiTokenType, IApiToken } from '../../types/models/api-token';
import { createApiToken } from '../../schema/api-token-schema';

interface IServices {
    apiTokenService: ApiTokenService;
    accessService: AccessService;
}

class ApiTokenController extends Controller {
    private apiTokenService: ApiTokenService;

    private accessService: AccessService;

    private logger: Logger;

    constructor(config: IUnleashConfig, services: IServices) {
        super(config);
        this.apiTokenService = services.apiTokenService;
        this.accessService = services.accessService;
        this.logger = config.getLogger('api-token-controller.js');

        this.get('/', this.getAllApiTokens, READ_API_TOKEN);
        this.post('/', this.createApiToken, CREATE_API_TOKEN);
        this.put('/:token', this.updateApiToken, UPDATE_API_TOKEN);
        this.delete('/:token', this.deleteApiToken, DELETE_API_TOKEN);
    }

    async getAllApiTokens(req: IAuthRequest, res: Response): Promise<void> {
        const { user } = req;
        const tokens = await this.accessibleTokens(user);
        res.json({ tokens });
    }

    async createApiToken(req: IAuthRequest, res: Response): Promise<any> {
        const createToken = await createApiToken.validateAsync(req.body);
        const token = await this.apiTokenService.createApiToken(createToken);
        return res.status(201).json(token);
    }

    async deleteApiToken(req: IAuthRequest, res: Response): Promise<void> {
        const { token } = req.params;

        await this.apiTokenService.delete(token);
        res.status(200).end();
    }

    async updateApiToken(req: IAuthRequest, res: Response): Promise<any> {
        const { token } = req.params;
        const { expiresAt } = req.body;

        if (!expiresAt) {
            this.logger.error(req.body);
            return res.status(400).send();
        }

        await this.apiTokenService.updateExpiry(token, expiresAt);
        return res.status(200).end();
    }

    private async accessibleTokens(user: User): Promise<IApiToken[]> {
        const allTokens = await this.apiTokenService.getAllTokens();

        if (user.isAPI && user.permissions.includes(ADMIN)) {
            return allTokens;
        }

        if (await this.accessService.hasPermission(user, UPDATE_API_TOKEN)) {
            return allTokens;
        }

        return allTokens.filter((t) => t.type !== ApiTokenType.ADMIN);
    }
}

module.exports = ApiTokenController;
export default ApiTokenController;
