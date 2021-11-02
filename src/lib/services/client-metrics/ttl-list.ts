import { EventEmitter } from 'events';
import List from './list';
import {
    add,
    addMilliseconds,
    secondsToMilliseconds,
    Duration,
    isFuture,
} from 'date-fns';

interface ConstructorArgs {
    interval: number;
    expireAmount: number;
    expireType: keyof Duration | 'milliseconds';
}

// this list must have entries with sorted ttl range
export default class TTLList<T> extends EventEmitter {
    private readonly interval: number;

    private readonly expireAmount: number;

    private readonly expireType: keyof Duration | 'milliseconds';

    public list: List<{ ttl: Date; value: T }>;

    private timer: NodeJS.Timeout;

    private readonly getExpiryFrom: (timestamp) => Date;

    constructor({
        interval = secondsToMilliseconds(1),
        expireAmount = 1,
        expireType = 'hours',
    }: Partial<ConstructorArgs> = {}) {
        super();
        this.interval = interval;
        this.expireAmount = expireAmount;
        this.expireType = expireType;

        this.getExpiryFrom = (timestamp) => {
            if (this.expireType === 'milliseconds') {
                return addMilliseconds(timestamp, expireAmount);
            } else {
                return add(timestamp, { [expireType]: expireAmount });
            }
        };

        this.list = new List();

        this.list.on('evicted', ({ value, ttl }) => {
            this.emit('expire', value, ttl);
        });
        this.startTimer();
    }

    startTimer(): void {
        if (this.list) {
            this.timer = setTimeout(() => {
                if (this.list) {
                    this.timedCheck();
                }
            }, this.interval);
            this.timer.unref();
        }
    }

    add(value: T, timestamp = new Date()): void {
        const ttl = this.getExpiryFrom(timestamp);
        if (isFuture(ttl)) {
            this.list.add({ ttl, value });
        } else {
            this.emit('expire', value, ttl);
        }
    }

    timedCheck(): void {
        this.list.reverseRemoveUntilTrue(({ value }) => isFuture(value.ttl));
        this.startTimer();
    }

    destroy(): void {
        clearTimeout(this.timer);
        this.timer = null;
        this.list = null;
    }
}
