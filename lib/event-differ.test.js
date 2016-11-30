'use strict';

const test = require('ava');
const eventDiffer = require('./event-differ');
const eventType = require('./event-type');
const logger = require('./logger');

test.beforeEach(() =>  {
    logger.setLevel('FATAL');
});

test('fails if events include an unknown event type', t => {
    const events = [
        { type: eventType.featureCreated, data: {} },
        { type: 'unknown-type', data: {} },
    ];

    t.throws(() => {
        eventDiffer.addDiffs(events);
    });
});

test('diffs a feature-update event', t => {
    const feature = 'foo';
    const desc = 'bar';

    const events = [
        {
            type: eventType.featureUpdated,
            data: { name: feature, description: desc, strategy: 'default', enabled: true, parameters: { value: 2 } },
        },
        {
            type: eventType.featureCreated,
            data: { name: feature, description: desc, strategy: 'default', enabled: false, parameters: { value: 1 } },
        },
    ];

    eventDiffer.addDiffs(events);

    const diffs = events[0].diffs;
    t.true(diffs[0].kind === 'E');
    t.true(diffs[0].path[0] === 'enabled');
    t.true(diffs[0].kind === 'E');
    t.true(diffs[0].lhs === false);
    t.true(diffs[0].rhs);

    t.true(diffs[1].kind === 'E');
    t.true(diffs[1].path[0] === 'parameters');
    t.true(diffs[1].path[1] === 'value');
    t.true(diffs[1].kind === 'E');
    t.true(diffs[1].lhs === 1);

    t.true(events[1].diffs === null);
});

test('diffs only against features with the same name', t => {
    const events = [
        {
            type: eventType.featureUpdated,
            data: { name: 'bar', description: 'desc', strategy: 'default', enabled: true, parameters: {} },
        },
        {
            type: eventType.featureUpdated,
            data: { name: 'foo', description: 'desc', strategy: 'default', enabled: false, parameters: {} },
        },
        {
            type: eventType.featureCreated,
            data: { name: 'bar', description: 'desc', strategy: 'default', enabled: false, parameters: {} },
        },
        {
            type: eventType.featureCreated,
            data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} },
        },
    ];

    eventDiffer.addDiffs(events);

    t.true(events[0].diffs[0].rhs === true);
    t.true(events[1].diffs[0].rhs === false);
    t.true(events[2].diffs === null);
    t.true(events[3].diffs === null);
});

test('sets an empty array of diffs if nothing was changed', t => {
    const events = [
        {
            type: eventType.featureUpdated,
            data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} },
        },
        {
            type: eventType.featureCreated,
            data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} },
        },
    ];

    eventDiffer.addDiffs(events);
    t.deepEqual(events[0].diffs, []);
});

test('sets diffs to null if there was nothing to diff against', t => {
    const events = [
        {
            type: eventType.featureUpdated,
            data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} },
        },
    ];

    eventDiffer.addDiffs(events);
    t.true(events[0].diffs === null);
});

