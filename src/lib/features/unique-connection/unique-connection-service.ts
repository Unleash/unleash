import type { IUnleashConfig } from '../../types/option';
import type { IFlagResolver, IUnleashStores } from '../../types';
import type { Logger } from '../../logger';
import type { IUniqueConnectionStore } from './unique-connection-store-type';
import HyperLogLog from 'hyperloglog-lite';
import type EventEmitter from 'events';
import { SDK_CONNECTION_ID_RECEIVED } from '../../metric-events';
import { REGISTERS_EXPONENT } from './hyperloglog-config';

export class UniqueConnectionService {
    private logger: Logger;

    private uniqueConnectionStore: IUniqueConnectionStore;

    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private activeHour: number;

    private hll = HyperLogLog(REGISTERS_EXPONENT);

    constructor(
        {
            uniqueConnectionStore,
        }: Pick<IUnleashStores, 'uniqueConnectionStore'>,
        config: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
    ) {
        this.uniqueConnectionStore = uniqueConnectionStore;
        this.logger = config.getLogger('services/unique-connection-service.ts');
        this.flagResolver = config.flagResolver;
        this.eventBus = config.eventBus;
        this.activeHour = new Date().getHours();
    }

    listen() {
        this.eventBus.on(SDK_CONNECTION_ID_RECEIVED, this.count.bind(this));
    }

    count(connectionId: string) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;
        this.hll.add(HyperLogLog.hash(connectionId));
    }

    async sync(currentTime = new Date()): Promise<void> {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;

        const currentHour = currentTime.getHours();
        const currentBucket = await this.uniqueConnectionStore.get('current');

        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.hll.merge({
                    n: REGISTERS_EXPONENT,
                    buckets: currentBucket.hll,
                });
                await this.uniqueConnectionStore.insert({
                    hll: this.hll.output().buckets,
                    id: 'previous',
                });
            } else {
                const previousBucket =
                    await this.uniqueConnectionStore.get('previous');
                if (previousBucket) {
                    this.hll.merge({
                        n: REGISTERS_EXPONENT,
                        buckets: previousBucket.hll,
                    });
                }
                await this.uniqueConnectionStore.insert({
                    hll: this.hll.output().buckets,
                    id: 'previous',
                });
            }

            this.activeHour = currentHour;
            this.hll = HyperLogLog(REGISTERS_EXPONENT);
        } else if (currentBucket) {
            this.hll.merge({
                n: REGISTERS_EXPONENT,
                buckets: currentBucket.hll,
            });
        }

        await this.uniqueConnectionStore.insert({
            hll: this.hll.output().buckets,
            id: 'current',
        });
    }
}
