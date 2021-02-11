'use strict';

const { EventEmitter } = require('events');
const moment = require('moment');
const List = require('./list');

// this list must have entries with sorted ttl range
module.exports = class TTLList extends EventEmitter {
    constructor({
        interval = 1000,
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
        const ttl = moment(timestamp).add(this.expireAmount, this.expireType);
        if (moment().isBefore(ttl)) {
            this.list.add({ ttl, value });
        } else {
            this.emit('expire', value, ttl);
        }
    }

    timedCheck() {
        const now = moment();
        this.list.reverseRemoveUntilTrue(({ value }) =>
            now.isBefore(value.ttl),
        );
        this.startTimer();
    }

    destroy() {
        // https://github.com/nodejs/node/issues/9561
        // clearTimeout(this.timer);
        // this.timer = null;
        this.list = null;
    }
};
