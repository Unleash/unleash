import type { Response } from 'express';
import Controller from '../../routes/controller';
import type { IFlagResolver, IUnleashConfig } from '../../types';
import type { Logger } from '../../logger';
import type { IAuthRequest } from '../../routes/unleash-types';
import { NONE } from '../../types/permissions';
import type { ClientFeatureSchema } from '../../openapi/spec/client-feature-schema';

export class FeatureStreamingController extends Controller {
    private readonly logger: Logger;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig) {
        super(config);
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('client-api/streaming.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getFeatureStream,
            permission: NONE,
            middleware: [],
        });
    }

    async getFeatureStream(
        req: IAuthRequest,
        res: Response<ClientFeatureSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('streaming')) {
            res.status(403).end();
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });

        const data = new Date().getTime();
        res.write(`data: ${data} \n\n`);
        // @ts-expect-error
        res.flush();

        const handle = setInterval(() => {
            const data = new Date().getTime();

            console.log(`data: ${data} \n\n`);
            res.write(`id: 0\n`);
            res.write(`data: ${data} \n\n`);
            // @ts-expect-error
            res.flush();
        }, 3000);

        res.on('close', () => {
            console.log('closing connection');
            clearInterval(handle);
        });
    }
}
