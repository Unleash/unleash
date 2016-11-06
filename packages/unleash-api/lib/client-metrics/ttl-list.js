'use strict';

const { EventEmitter } = require('events');
const List = require('./list');
const moment = require('moment');

// this list must have entries with sorted ttl range
module.exports = class FIFOTTLList extends EventEmitter {
    constructor ({
        interval = 1000,
        expireAmount = 1,
        expireType = 'hours',
    } = {}) {
        super();
        this.expireAmount = expireAmount;
        this.expireType = expireType;

        this.list = new List();

        this.list.on('evicted', ({ value, ttl }) => {
            this.emit('expire', value, ttl);
        });

        this.timer = setInterval(() => {
            this.timedCheck();
        }, interval);
    }

    add (value, timestamp = new Date()) {
        const ttl = moment(timestamp).add(this.expireAmount, this.expireType);
        this.list.add({ ttl, value });
    }

    timedCheck () {
        const now = moment(new Date());
        this.list.reverseRemoveUntilTrue(({ value }) => now.isBefore(value.ttl));
    }

    destroy () {
        clearTimeout(this.timer);
        delete this.timer;
        this.list = null;
    }
};
