import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import { Logger } from '../../logger';
import { IAuthRequest, IUser } from '../../server-impl';
import { NONE } from '../../types/permissions';
import ConfigurationRevisionService, {
    UPDATE_REVISION,
} from '../../features/feature-toggle/configuration-revision-service';

export default class FeatureStreamController extends Controller {
    logger: Logger;

    clients: any[] = [];

    private configurationRevisionService: ConfigurationRevisionService;

    constructor(
        {
            configurationRevisionService,
        }: Pick<IUnleashServices, 'configurationRevisionService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.logger = config.getLogger('/api/client/stream');
        this.configurationRevisionService = configurationRevisionService;
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.notifyClients.bind(this),
        );

        this.route({
            method: 'get',
            path: '',
            handler: this.stream,
            permission: NONE,
        });
    }

    notifyClients(revisionId: number) {
        this.logger.debug('Notifying clients of new revision', revisionId);
        this.clients.forEach((client) => {
            client.res.write(`data: ${JSON.stringify({ revisionId })}\n\n`);
        });
    }

    async stream(req: IAuthRequest, res: Response<void>): Promise<void> {
        const headers = {
            'Content-Type': 'text/event-stream',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
        };
        res.writeHead(200, headers);

        const revisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        const toggles = { revisionId };

        const data = `data: ${JSON.stringify(toggles)}\n\n`;
        res.write(data);

        const clientId = Date.now(); // Use UUIDs for real-world scenarios

        const newClient = {
            id: clientId,
            res,
        };

        this.clients.push(newClient);

        req.on('close', () => {
            console.log(`${clientId} Connection closed`);
            this.clients = this.clients.filter(
                (client) => client.id !== clientId,
            );
        });
    }
}
