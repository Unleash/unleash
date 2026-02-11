import Controller from '../controller.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { Request, Response } from 'express';
import { type McpRequestHandler, createMcpHandler } from '@unleash/mcp/remote';
import { NONE } from '../../types/index.js';

class McpRemoteController extends Controller {
    private mcpHandler: McpRequestHandler;

    constructor(config: IUnleashConfig) {
        super(config);

        // we are sharing mcp handler between local and remote mode
        this.mcpHandler = createMcpHandler({
            baseUrl: config.server.unleashUrl,
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.handleMcp.bind(this),
            permission: NONE,
        });
    }

    async handleMcp(req: Request, res: Response): Promise<void> {
        const authHeaders = this.extractAuthHeaders(req);

        await this.mcpHandler(req, res, {
            authHeaders,
            parsedBody: req.body,
        });
    }

    private extractAuthHeaders(req: Request): Record<string, string> {
        const headers: Record<string, string> = {};

        if (req.get('authorization')) {
            headers.authorization = req.get('authorization')!;
        }
        if (req.get('cookie')) {
            headers.cookie = req.get('cookie')!;
        }

        return headers;
    }
}

export default McpRemoteController;
