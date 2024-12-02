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

type ResponseWithFlush = Response & { flush: Function };

export class FeatureStreamingController extends Controller {
    private readonly logger: Logger;

    private configurationRevisionService: ConfigurationRevisionService;

    private flagResolver: IFlagResolver;

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
        res: ResponseWithFlush,
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

        this.configurationRevisionService.on(UPDATE_REVISION, (e) =>
            this.onUpdateRevisionEvent(res, e),
        );

        res.on('close', () => {
            this.configurationRevisionService.removeListener(
                UPDATE_REVISION,
                (e) => this.onUpdateRevisionEvent(res, e),
            );
        });
    }

    private onUpdateRevisionEvent(res: ResponseWithFlush, event: any): void {
        res.write(`data: UPDATE\n\n`);
        res.flush();
    }
}
