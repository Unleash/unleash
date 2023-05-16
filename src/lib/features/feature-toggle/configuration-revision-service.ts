import { EventEmitter } from 'stream';
import { Logger } from '../../logger';
import { IEventStore, IUnleashConfig, IUnleashStores } from '../../types';

export const UPDATE_REVISION = 'UPDATE_REVISION';

export default class ConfigurationRevisionService extends EventEmitter {
    private logger: Logger;

    private eventStore: IEventStore;

    private revisionId: number;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        super();
        this.logger = getLogger('configuration-revision-service.ts');
        this.eventStore = eventStore;
    }

    async getMaxRevisionId(): Promise<number> {
        if (this.revisionId) {
            return this.revisionId;
        } else {
            return this.updateMaxRevisionId();
        }
    }

    async updateMaxRevisionId(): Promise<number> {
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
