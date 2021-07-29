'use strict';

const moment = require('moment');
const TTLList = require('./ttl-list');

test('should emit expire', (done) => {
    jest.useFakeTimers('modern');
    const list = new TTLList({
        interval: 20,
        expireAmount: 10,
        expireType: 'milliseconds',
    });

    list.on('expire', (entry) => {
        list.destroy();
        expect(entry.n).toBe(1);
        done();
    });

    list.add({ n: 1 });
    jest.advanceTimersByTime(21);
    jest.useRealTimers();
});

test('should slice off list', () => {
    jest.useFakeTimers('modern');

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

    list.on('expire', (entry) => {
        // console.timeEnd(entry.n);
        expired.push(entry);
    });

    jest.advanceTimersByTime(21);
    expect(expired).toHaveLength(1);

    jest.advanceTimersByTime(51);
    expect(expired).toHaveLength(2);

    jest.advanceTimersByTime(201);
    expect(expired).toHaveLength(3);

    jest.advanceTimersByTime(301);
    expect(expired).toHaveLength(4);

    list.destroy();
    jest.useRealTimers();
});
