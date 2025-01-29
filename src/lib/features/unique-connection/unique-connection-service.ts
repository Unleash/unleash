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

    private backendHll = HyperLogLog(REGISTERS_EXPONENT);

    private frontendHll = HyperLogLog(REGISTERS_EXPONENT);

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

    count({
        connectionId,
        type,
    }: { connectionId: string; type: 'frontend' | 'backend' }) {
        if (!this.flagResolver.isEnabled('uniqueSdkTracking')) return;
        const value = HyperLogLog.hash(connectionId);
        this.hll.add(value);
        if (type === 'frontend') {
            this.frontendHll.add(value);
        } else if (type === 'backend') {
            this.backendHll.add(value);
        }
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

        await this.syncBackend(currentTime);
        await this.syncFrontend(currentTime);

        if (this.activeHour !== currentHour) {
            this.activeHour = currentHour;
        }
    }

    async syncBackend(currentTime = new Date()): Promise<void> {
        const currentHour = currentTime.getHours();
        const currentBucket =
            await this.uniqueConnectionStore.get('currentBackend');

        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.backendHll.merge({
                    n: REGISTERS_EXPONENT,
                    buckets: currentBucket.hll,
                });
                await this.uniqueConnectionStore.insert({
                    hll: this.backendHll.output().buckets,
                    id: 'previousBackend',
                });
            } else {
                const previousBucket =
                    await this.uniqueConnectionStore.get('previousBackend');
                if (previousBucket) {
                    this.backendHll.merge({
                        n: REGISTERS_EXPONENT,
                        buckets: previousBucket.hll,
                    });
                }
                await this.uniqueConnectionStore.insert({
                    hll: this.backendHll.output().buckets,
                    id: 'previousBackend',
                });
            }

            this.backendHll = HyperLogLog(REGISTERS_EXPONENT);
        } else if (currentBucket) {
            this.backendHll.merge({
                n: REGISTERS_EXPONENT,
                buckets: currentBucket.hll,
            });
        }

        await this.uniqueConnectionStore.insert({
            hll: this.backendHll.output().buckets,
            id: 'currentBackend',
        });
    }

    async syncFrontend(currentTime = new Date()): Promise<void> {
        const currentHour = currentTime.getHours();
        const currentBucket =
            await this.uniqueConnectionStore.get('currentFrontend');

        if (this.activeHour !== currentHour && currentBucket) {
            if (currentBucket.updatedAt.getHours() < currentHour) {
                this.frontendHll.merge({
                    n: REGISTERS_EXPONENT,
                    buckets: currentBucket.hll,
                });
                await this.uniqueConnectionStore.insert({
                    hll: this.frontendHll.output().buckets,
                    id: 'previousFrontend',
                });
            } else {
                const previousBucket =
                    await this.uniqueConnectionStore.get('previousFrontend');
                if (previousBucket) {
                    this.frontendHll.merge({
                        n: REGISTERS_EXPONENT,
                        buckets: previousBucket.hll,
                    });
                }
                await this.uniqueConnectionStore.insert({
                    hll: this.frontendHll.output().buckets,
                    id: 'previousFrontend',
                });
            }

            this.frontendHll = HyperLogLog(REGISTERS_EXPONENT);
        } else if (currentBucket) {
            this.frontendHll.merge({
                n: REGISTERS_EXPONENT,
                buckets: currentBucket.hll,
            });
        }

        await this.uniqueConnectionStore.insert({
            hll: this.frontendHll.output().buckets,
            id: 'currentFrontend',
        });
    }
}
