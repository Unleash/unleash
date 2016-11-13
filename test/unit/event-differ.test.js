'use strict';

const test = require('ava');
const eventDiffer = require('../../lib/event-differ');
const eventType = require('../../lib/event-type');
const logger = require('../../lib/logger');

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

    t.deepEqual(events[0].diffs, [
        { kind: 'E', path: ['enabled'], lhs: false, rhs: true },
        { kind: 'E', path: ['parameters', 'value'], lhs: 1, rhs: 2 },
    ]);

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

