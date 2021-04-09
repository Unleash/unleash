import { Response } from 'express';

import Controller from '../controller';
import {
    ADMIN,
    CREATE_API_TOKEN,
    DELETE_API_TOKEN,
    UPDATE_API_TOKEN,
} from '../../permissions';
import { ApiTokenService } from '../../services/api-token-service';
import { Logger, LogProvider } from '../../logger';
import { ApiTokenType } from '../../db/api-token-store';
import { AccessService } from '../../services/access-service';
import { IAuthRequest } from '../unleash-types';
import { isRbacEnabled } from '../../util/feature-enabled';
import User from '../../user';
import { IUnleashConfig } from '../../types/core';

interface IServices {
    apiTokenService: ApiTokenService;
    accessService: AccessService;
}

class ApiTokenController extends Controller {
    private apiTokenService: ApiTokenService;

    private accessService: AccessService;

    private extendedPermissions: boolean;

    private isRbacEnabled: boolean;

    private logger: Logger;

    constructor(config: IUnleashConfig, services: IServices) {
        super(config);
        this.apiTokenService = services.apiTokenService;
        this.accessService = services.accessService;
        this.extendedPermissions = config.extendedPermissions;
        this.isRbacEnabled = isRbacEnabled(config);
        this.logger = config.getLogger('api-token-controller.js');

        this.get('/', this.getAllApiTokens);
        this.post('/', this.createApiToken, CREATE_API_TOKEN);
        this.put('/:token', this.updateApiToken, UPDATE_API_TOKEN);
        this.delete('/:token', this.deleteApiToken, DELETE_API_TOKEN);
    }

    private isTokenAdmin(user: User) {
        if (this.isRbacEnabled) {
            return this.accessService.hasPermission(user, UPDATE_API_TOKEN);
        }
        if (this.extendedPermissions) {
            return user.permissions.some(
                t => t === UPDATE_API_TOKEN || t === ADMIN,
            );
        }
        return true;
    }

    async getAllApiTokens(req: IAuthRequest, res: Response): Promise<void> {
        const { user } = req;
        const isAdmin = this.isTokenAdmin(user);

        const tokens = await this.apiTokenService.getAllTokens();

        if (isAdmin) {
            res.json({ tokens });
        } else {
            const filteredTokens = tokens.filter(
                t => !(t.type === ApiTokenType.ADMIN),
            );
            res.json({ tokens: filteredTokens });
        }
    }

    async createApiToken(req: IAuthRequest, res: Response): Promise<any> {
        const { username, type, expiresAt } = req.body;

        if (!username || !type) {
            this.logger.error(req.body);
            return res.status(400).send();
        }

        const tokenType =
            type.toLowerCase() === 'admin'
                ? ApiTokenType.ADMIN
                : ApiTokenType.CLIENT;

        try {
            const token = await this.apiTokenService.creteApiToken({
                type: tokenType,
                username,
                expiresAt,
            });
            return res.status(201).json(token);
        } catch (error) {
            this.logger.error('error creating api-token', error);
            return res.status(500);
        }
    }

    async deleteApiToken(req: IAuthRequest, res: Response): Promise<void> {
        const { token } = req.params;

        try {
            await this.apiTokenService.delete(token);
            res.status(200).end();
        } catch (error) {
            this.logger.error('error creating api-token', error);
            res.status(500);
        }
    }

    async updateApiToken(req: IAuthRequest, res: Response): Promise<any> {
        const { token } = req.params;
        const { expiresAt } = req.body;

        if (!expiresAt) {
            this.logger.error(req.body);
            return res.status(400).send();
        }

        try {
            await this.apiTokenService.updateExpiry(token, expiresAt);
            return res.status(200).end();
        } catch (error) {
            this.logger.error('error creating api-token', error);
            return res.status(500);
        }
    }
}

module.exports = ApiTokenController;
export default ApiTokenController;
