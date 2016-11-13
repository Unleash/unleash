'use strict';

const { EventEmitter } = require('events');

class Node {
    constructor (value) {
        this.value = value;
        this.next = null;
    }

    link (next) {
        this.next = next;
        next.prev = this;
        return this;
    }
}

module.exports = class List extends EventEmitter {
    constructor () {
        super();
        this.start = null;
        this.tail = null;
    }

    add (obj) {
        const node = new Node(obj);
        if (this.start) {
            this.start = node.link(this.start);
        } else {
            this.start = node;
            this.tail = node;
        }
        return node;
    }

    iterate (fn) {
        if (!this.start) {
            return;
        }
        let cursor = this.start;
        while (cursor) {
            const result = fn(cursor);
            if (result === false) {
                cursor = null;
            } else {
                cursor = cursor.next;
            }
        }
    }

    iterateReverse (fn) {
        if (!this.tail) {
            return;
        }
        let cursor = this.tail;
        while (cursor) {
            const result = fn(cursor);
            if (result === false) {
                cursor = null;
            } else {
                cursor = cursor.prev;
            }
        }
    }

    reverseRemoveUntilTrue (fn) {
        if (!this.tail) {
            return;
        }

        let cursor = this.tail;
        while (cursor) {
            const result = fn(cursor);
            if (result === false && cursor === this.start) {
                // whole list is removed
                this.emit('evicted', cursor.value);
                this.start = null;
                this.tail  = null;
                // stop iteration
                cursor = null;
            } else if (result === true) {
                // when TRUE, set match as new tail
                if (cursor !== this.tail) {
                    this.tail = cursor;
                    cursor.next = null;
                }
                // stop iteration
                cursor = null;
            } else {
                // evicted
                this.emit('evicted', cursor.value);
                // iterate to next
                cursor = cursor.prev;
            }
        }
    }

    toArray () {
        const result = [];

        if (this.start) {
            let cursor = this.start;
            while (cursor) {
                result.push(cursor.value);
                cursor = cursor.next;
            }
        }

        return result;
    }

    // toArrayReverse () {
    //     const result = [];

    //     if (this.tail) {
    //         let cursor = this.tail;
    //         while (cursor) {
    //             result.push(cursor.value);
    //             cursor = cursor.prev;
    //         }
    //     }

    //     return result;
    // }
};
