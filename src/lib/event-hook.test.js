'use strict';

const { EventEmitter } = require('events');

const eventStore = new EventEmitter();
const { addEventHook } = require('./event-hook');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('./types/events');

const o = {};

function testHook(feature, data) {
    o[feature] = data;
}

beforeAll(() => {
    addEventHook(testHook, eventStore);
});

[FEATURE_CREATED, FEATURE_UPDATED, FEATURE_ARCHIVED, FEATURE_REVIVED].forEach(
    (feature) => {
        test(`should invoke hook on ${feature}`, () => {
            const data = { dataKey: feature };
            eventStore.emit(feature, data);
            expect(o[feature] === data).toBe(true);
        });
    },
);
