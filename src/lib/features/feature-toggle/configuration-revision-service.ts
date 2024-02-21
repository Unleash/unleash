import { EventEmitter } from 'stream';
import { Logger } from '../../logger';
import {
    IEventStore,
    IFlagResolver,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

export const UPDATE_REVISION = 'UPDATE_REVISION';

export default class ConfigurationRevisionService extends EventEmitter {
    private logger: Logger;

    private eventStore: IEventStore;

    private revisionId: number;

    private flagResolver: IFlagResolver;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        super();
        this.logger = getLogger('configuration-revision-service.ts');
        this.eventStore = eventStore;
        this.flagResolver = flagResolver;
        this.revisionId = 0;
    }

    async getMaxRevisionId(): Promise<number> {
        if (this.revisionId > 0) {
            return this.revisionId;
        } else {
            return this.updateMaxRevisionId();
        }
    }

    async updateMaxRevisionId(): Promise<number> {
        if (this.flagResolver.isEnabled('disableUpdateMaxRevisionId')) {
            return 0;
        }

        const revisionId = await this.eventStore.getMaxRevisionId(
            this.revisionId,
        );
        if (this.revisionId !== revisionId) {
            this.logger.debug(
                'Updating feature configuration with new revision Id',
                revisionId,
            );
            this.emit(UPDATE_REVISION, revisionId);
            this.revisionId = revisionId;
        }

        return this.revisionId;
    }
}
