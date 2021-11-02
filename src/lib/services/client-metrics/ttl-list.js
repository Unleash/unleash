'use strict';

const { EventEmitter } = require('events');
const List = require('./list');
const {
    add,
    isFuture,
    addMilliseconds,
    secondsToMilliseconds,
} = require('date-fns');

// this list must have entries with sorted ttl range
module.exports = class TTLList extends EventEmitter {
    constructor({
        interval = secondsToMilliseconds(1),
        expireAmount = 1,
        expireType = 'hours',
    } = {}) {
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

    startTimer() {
        if (this.list) {
            this.timer = setTimeout(() => {
                if (this.list) {
                    this.timedCheck();
                }
            }, this.interval);
            this.timer.unref();
        }
    }

    add(value, timestamp = new Date()) {
        const ttl = this.getExpiryFrom(timestamp);
        if (isFuture(ttl)) {
            this.list.add({ ttl, value });
        } else {
            this.emit('expire', value, ttl);
        }
    }

    timedCheck() {
        this.list.reverseRemoveUntilTrue(({ value }) => isFuture(value.ttl));
        this.startTimer();
    }

    destroy() {
        clearTimeout(this.timer);
        this.timer = null;
        this.list = null;
    }
};
