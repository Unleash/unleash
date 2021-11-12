/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */

import { EventEmitter } from 'events';

class Node<T> {
    value: T | null;

    prev: Node<T> | null;

    next: Node<T> | null;

    constructor(value: T) {
        this.value = value;
        this.next = null;
    }

    link(next: Node<T>) {
        this.next = next;
        next.prev = this;
        return this;
    }
}

type IteratorFn<T, U = unknown> = (cursor: Node<T>) => U;

export default class List<T> extends EventEmitter {
    private start: Node<T> | null;

    private tail: Node<T> | null;

    constructor() {
        super();
        this.start = null;
        this.tail = null;
    }

    add(obj: T): Node<T> {
        const node = new Node(obj);
        if (this.start) {
            this.start = node.link(this.start);
        } else {
            this.start = node;
            this.tail = node;
        }
        return node;
    }

    iterate(fn: IteratorFn<T>): void {
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

    iterateReverse(fn: IteratorFn<T>): void {
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

    reverseRemoveUntilTrue(fn: IteratorFn<T, boolean>): void {
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
                this.tail = null;
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

    toArray(): T[] {
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
}
