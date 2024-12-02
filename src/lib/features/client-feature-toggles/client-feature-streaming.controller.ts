import type { Response } from 'express';
import Controller from '../../routes/controller';
import type {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
} from '../../types';
import type { Logger } from '../../logger';
import type { IAuthRequest } from '../../routes/unleash-types';
import { NONE } from '../../types/permissions';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../feature-toggle/configuration-revision-service';

type SSEClientResponse = Response & { flush: Function };

export class FeatureStreamingController extends Controller {
    private readonly logger: Logger;

    private configurationRevisionService: ConfigurationRevisionService;

    private flagResolver: IFlagResolver;

    private activeConnections: Set<SSEClientResponse>;

    constructor(
        {
            configurationRevisionService,
        }: Pick<IUnleashServices, 'configurationRevisionService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.configurationRevisionService = configurationRevisionService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('client-api/streaming.js');

        this.activeConnections = new Set();
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );

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
        res: SSEClientResponse,
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

        res.write(`data: CONNECTED\n\n`);
        res.flush();

        this.activeConnections.add(res);

        res.on('close', () => {
            this.activeConnections.delete(res);
        });
    }

    private onUpdateRevisionEvent() {
        for (const res of this.activeConnections) {
            try {
                res.write(`data: UPDATE\n\n`);
                res.flush();
            } catch (err) {
                this.logger.info('Failed to send event. Dropping connection.');
                this.activeConnections.delete(res);
            }
        }
    }
}
