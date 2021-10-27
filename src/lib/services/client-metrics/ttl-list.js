'use strict';

const { EventEmitter } = require('events');
const List = require('./list');
const { millisecondsInSecond, add, isFuture } = require('date-fns');

// this list must have entries with sorted ttl range
module.exports = class TTLList extends EventEmitter {
    constructor({
        interval = millisecondsInSecond,
        expireAmount = 1,
        expireType = 'hours',
    } = {}) {
        super();
        this.interval = interval;
        this.expireAmount = expireAmount;
        this.expireType = expireType;

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
        const ttl = add(timestamp, { [this.expireType]: this.expireAmount });
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
