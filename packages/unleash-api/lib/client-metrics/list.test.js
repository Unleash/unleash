'use strict';

const test = require('ava');
const List = require('./list');

function getList () {
    const list = new List();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    list.add(5);
    list.add(6);
    list.add(7);
    return list;
}

test('should emit "evicted" events for objects leaving list', (t) => {
    const list = getList();
    const evictedList = [];
    list.on('evicted', (value) => {
        evictedList.push(value);
    });

    t.true(evictedList.length === 0);

    list.reverseRemoveUntilTrue(({ value }) => {
        if (value === 4) {
            return true;
        }
        return false;
    });

    t.true(evictedList.length === 3);

    list.reverseRemoveUntilTrue(() => false);

    t.true(evictedList.length === 7);

    list.add(1);
    list.reverseRemoveUntilTrue(() => false);

    t.true(evictedList.length === 8);
});

test('list should be able remove until given value', (t) => {
    const list = getList();

    t.true(list.toArray().length === 7);

    list.reverseRemoveUntilTrue(({ value }) => value === 4);
    t.true(list.toArray().length === 4);

    list.reverseRemoveUntilTrue(({ value }) => value === 5);
    t.true(list.toArray().length === 3);

    list.reverseRemoveUntilTrue(({ value }) => value === 5);
    t.true(list.toArray().length === 3);
});

test('list can be cleared and re-add entries', (t) => {
    const list = getList();

    list.add(8);
    list.add(9);

    t.true(list.toArray().length === 9);

    list.reverseRemoveUntilTrue(() => false);

    t.true(list.toArray().length === 0);

    list.add(1);
    list.add(2);
    list.add(3);

    t.true(list.toArray().length === 3);
});


test('should iterate', (t) => {
    const list = getList();

    let iterateCount = 0;
    list.iterate(({ value }) => {
        iterateCount++;
        if (value === 4) {
            return false;
        }
        return true;
    });
    t.true(iterateCount === 4);
});

test('should reverse iterate', (t) => {
    const list = getList();

    let iterateCount = 0;
    list.iterateReverse(({ value }) => {
        iterateCount++;
        if (value === 5) {
            return false;
        }
        return true;
    });
    t.true(iterateCount === 5);
});
