'use strict';

const List = require('./list');

function getList() {
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

test('should emit "evicted" events for objects leaving list', () => {
    const list = getList();
    const evictedList = [];
    list.on('evicted', (value) => {
        evictedList.push(value);
    });

    expect(evictedList.length === 0).toBe(true);

    list.reverseRemoveUntilTrue(({ value }) => {
        if (value === 4) {
            return true;
        }
        return false;
    });

    expect(evictedList.length === 3).toBe(true);

    list.reverseRemoveUntilTrue(() => false);

    expect(evictedList.length === 7).toBe(true);

    list.add(1);
    list.reverseRemoveUntilTrue(() => false);

    expect(evictedList.length === 8).toBe(true);
});

test('list should be able remove until given value', () => {
    const list = getList();

    expect(list.toArray().length === 7).toBe(true);

    list.reverseRemoveUntilTrue(({ value }) => value === 4);
    expect(list.toArray().length === 4).toBe(true);

    list.reverseRemoveUntilTrue(({ value }) => value === 5);
    expect(list.toArray().length === 3).toBe(true);

    list.reverseRemoveUntilTrue(({ value }) => value === 5);
    expect(list.toArray().length === 3).toBe(true);
});

test('list can be cleared and re-add entries', () => {
    const list = getList();

    list.add(8);
    list.add(9);

    expect(list.toArray().length === 9).toBe(true);

    list.reverseRemoveUntilTrue(() => false);

    expect(list.toArray().length === 0).toBe(true);

    list.add(1);
    list.add(2);
    list.add(3);

    expect(list.toArray().length === 3).toBe(true);
});

test('should not iterate empty list ', () => {
    const list = new List();

    let iterateCount = 0;
    list.iterate(() => {
        iterateCount++;
    });
    expect(iterateCount === 0).toBe(true);
});

test('should iterate', () => {
    const list = getList();

    let iterateCount = 0;
    list.iterate(({ value }) => {
        iterateCount++;
        if (value === 4) {
            return false;
        }
        return true;
    });
    expect(iterateCount === 4).toBe(true);
});

test('should reverse iterate', () => {
    const list = getList();

    let iterateCount = 0;
    list.iterateReverse(({ value }) => {
        iterateCount++;
        if (value === 5) {
            return false;
        }
        return true;
    });
    expect(iterateCount === 5).toBe(true);
});

test('should not reverse iterate empty list', () => {
    const list = new List();

    let iterateCount = 0;
    list.iterateReverse(() => {
        iterateCount++;
    });
    expect(iterateCount === 0).toBe(true);
});
