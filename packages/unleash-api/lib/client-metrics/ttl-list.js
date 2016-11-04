'use strict';

const { EventEmitter } = require('events');
const yallist = require('yallist');
const moment = require('moment');

// this list must have entires with sorted ttl range
module.exports = class TTLList extends EventEmitter {
    constructor () {
        super();
        this.cache = yallist.create();
        setInterval(() => {
            this.timedCheck();
        }, 1000);
    }

    expire (entry) {
        this.emit('expire', entry.value);
    }

    add (value, timestamp) {
        const ttl = moment(timestamp).add(1, 'hour');
        this.cache.push({ ttl, value });
    }

    timedCheck () {
        const now = moment(new Date());
        // find index to remove
        let done = false;
        // TODO: might use internal linkedlist
        this.cache.forEachReverse((entry, index) => {
            console.log(now.format(), entry.ttl.format());
            if (done) {
                return;
            } else if (now.isBefore(entry.ttl)) {
                // When we hit a valid ttl, remove next items in list (iteration is reversed)
                this.cache = this.cache.slice(0, index + 1);
                done = true;
            } else if (index === 0) {
                this.expire(entry);
                // if rest of list has timed out, let it DIE!
                this.cache = yallist.create(); // empty=
            } else {
                this.expire(entry);
            }
        });
    }
}
