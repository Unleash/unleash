'use strict';;
const eventDiffer = require('./event-differ');
const { FEATURE_CREATED, FEATURE_UPDATED } = require('./event-type');

test('should not fail if events include an unknown event type', () => {
    const events = [
        { type: FEATURE_CREATED, data: {} },
        { type: 'unknown-type', data: {} },
    ];

    eventDiffer.addDiffs(events);

    expect(true).toBe(true);
});

test('diffs a feature-update event', () => {
    const feature = 'foo';
    const desc = 'bar';

    const events = [
        {
            type: FEATURE_UPDATED,
            data: {
                name: feature,
                description: desc,
                strategy: 'default',
                enabled: true,
                parameters: { value: 2 },
            },
        },
        {
            type: FEATURE_CREATED,
            data: {
                name: feature,
                description: desc,
                strategy: 'default',
                enabled: false,
                parameters: { value: 1 },
            },
        },
    ];

    eventDiffer.addDiffs(events);

    const { diffs } = events[0];
    expect(diffs[0].kind === 'E').toBe(true);
    expect(diffs[0].path[0] === 'enabled').toBe(true);
    expect(diffs[0].kind === 'E').toBe(true);
    expect(diffs[0].lhs === false).toBe(true);
    expect(diffs[0].rhs).toBe(true);

    expect(diffs[1].kind === 'E').toBe(true);
    expect(diffs[1].path[0] === 'parameters').toBe(true);
    expect(diffs[1].path[1] === 'value').toBe(true);
    expect(diffs[1].kind === 'E').toBe(true);
    expect(diffs[1].lhs === 1).toBe(true);

    expect(events[1].diffs === null).toBe(true);
});

test('diffs only against features with the same name', () => {
    const events = [
        {
            type: FEATURE_UPDATED,
            data: {
                name: 'bar',
                description: 'desc',
                strategy: 'default',
                enabled: true,
                parameters: {},
            },
        },
        {
            type: FEATURE_UPDATED,
            data: {
                name: 'foo',
                description: 'desc',
                strategy: 'default',
                enabled: false,
                parameters: {},
            },
        },
        {
            type: FEATURE_CREATED,
            data: {
                name: 'bar',
                description: 'desc',
                strategy: 'default',
                enabled: false,
                parameters: {},
            },
        },
        {
            type: FEATURE_CREATED,
            data: {
                name: 'foo',
                description: 'desc',
                strategy: 'default',
                enabled: true,
                parameters: {},
            },
        },
    ];

    eventDiffer.addDiffs(events);

    expect(events[0].diffs[0].rhs === true).toBe(true);
    expect(events[1].diffs[0].rhs === false).toBe(true);
    expect(events[2].diffs === null).toBe(true);
    expect(events[3].diffs === null).toBe(true);
});

test('sets an empty array of diffs if nothing was changed', () => {
    const events = [
        {
            type: FEATURE_UPDATED,
            data: {
                name: 'foo',
                description: 'desc',
                strategy: 'default',
                enabled: true,
                parameters: {},
            },
        },
        {
            type: FEATURE_CREATED,
            data: {
                name: 'foo',
                description: 'desc',
                strategy: 'default',
                enabled: true,
                parameters: {},
            },
        },
    ];

    eventDiffer.addDiffs(events);
    expect(events[0].diffs).toEqual([]);
});

test('sets diffs to null if there was nothing to diff against', () => {
    const events = [
        {
            type: FEATURE_UPDATED,
            data: {
                name: 'foo',
                description: 'desc',
                strategy: 'default',
                enabled: true,
                parameters: {},
            },
        },
    ];

    eventDiffer.addDiffs(events);
    expect(events[0].diffs === null).toBe(true);
});
