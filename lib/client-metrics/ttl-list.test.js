'use strict';

const test = require('ava');
const TTLList = require('./ttl-list');
const moment = require('moment');
const sinon = require('sinon');

test.cb('should emit expire', t => {
    const list = new TTLList({
        interval: 20,
        expireAmount: 10,
        expireType: 'milliseconds',
    });

    list.on('expire', entry => {
        list.destroy();
        t.true(entry.n === 1);
        t.end();
    });

    list.add({ n: 1 });
});

test.cb('should slice off list', t => {
    const clock = sinon.useFakeTimers();

    const list = new TTLList({
        interval: 10,
        expireAmount: 10,
        expireType: 'milliseconds',
    });

    list.add({ n: '1' }, moment().add(1, 'milliseconds'));
    list.add({ n: '2' }, moment().add(50, 'milliseconds'));
    list.add({ n: '3' }, moment().add(200, 'milliseconds'));
    list.add({ n: '4' }, moment().add(300, 'milliseconds'));

    const expired = [];

    list.on('expire', entry => {
        // console.timeEnd(entry.n);
        expired.push(entry);
    });

    clock.tick(21);
    t.true(expired.length === 1);

    clock.tick(51);
    t.true(expired.length === 2);

    clock.tick(201);
    t.true(expired.length === 3);

    clock.tick(301);
    t.true(expired.length === 4);

    list.destroy();
    clock.restore();
    sinon.restore();

    t.end();
});
