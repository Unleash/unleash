'use strict';

const TTLList = require('./ttl-list');
const { addMilliseconds } = require('date-fns');

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

    list.add({ n: '1' }, addMilliseconds(Date.now(), 1));
    list.add({ n: '2' }, addMilliseconds(Date.now(), 50));
    list.add({ n: '3' }, addMilliseconds(Date.now(), 200));
    list.add({ n: '4' }, addMilliseconds(Date.now(), 300));

    const expired = [];

    list.on('expire', (entry) => {
        // console.timeEnd(entry.n);
        expired.push(entry);
    });

    expect(expired).toHaveLength(0);
    expect(list.list.toArray()).toHaveLength(4);

    jest.advanceTimersByTime(21);
    expect(expired).toHaveLength(1);
    expect(list.list.toArray()).toHaveLength(3);

    jest.advanceTimersByTime(51);
    expect(expired).toHaveLength(2);
    expect(list.list.toArray()).toHaveLength(2);

    jest.advanceTimersByTime(201);
    expect(expired).toHaveLength(3);
    expect(list.list.toArray()).toHaveLength(1);

    jest.advanceTimersByTime(301);
    expect(expired).toHaveLength(4);
    expect(list.list.toArray()).toHaveLength(0);

    list.destroy();
    jest.useRealTimers();
});

test('should add item created in the past but expiring in the future', () => {
    jest.useFakeTimers('modern');

    const list = new TTLList({
        interval: 10,
        expireAmount: 10,
        expireType: 'milliseconds',
    });

    const expireCallback = jest.fn();
    list.on('expire', expireCallback);

    list.add({ n: '1' }, new Date());

    expect(expireCallback).not.toHaveBeenCalled();
    expect(list.list.toArray()).toHaveLength(1);

    jest.useRealTimers();
});
