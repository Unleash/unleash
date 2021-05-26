'use strict';

const moment = require('moment');
const lolex = require('lolex');
const TTLList = require('./ttl-list');

test('should emit expire', done => {
    const clock = lolex.install();
    const list = new TTLList({
        interval: 20,
        expireAmount: 10,
        expireType: 'milliseconds',
    });

    list.on('expire', entry => {
        list.destroy();
        expect(entry.n === 1).toBe(true);
        done();
    });

    list.add({ n: 1 });
    clock.tick(21);
});

test('should slice off list', () => {
    const clock = lolex.install();

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
    expect(expired.length === 1).toBe(true);

    clock.tick(51);
    expect(expired.length === 2).toBe(true);

    clock.tick(201);
    expect(expired.length === 3).toBe(true);

    clock.tick(301);
    expect(expired.length === 4).toBe(true);

    list.destroy();
    clock.uninstall();
});
