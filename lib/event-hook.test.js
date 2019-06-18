'use strict';

const test = require('ava');
const { EventEmitter } = require('events');
const eventStore = new EventEmitter();
const { addEventHook } = require('./event-hook');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('./event-type');

const o = {};

function testHook(feature, data) {
    o[feature] = data;
}

test.before(() => {
    addEventHook(testHook, eventStore);
});

[FEATURE_CREATED, FEATURE_UPDATED, FEATURE_ARCHIVED, FEATURE_REVIVED].forEach(
    feature => {
        test(`should invoke hook on ${feature}`, t => {
            const data = { dataKey: feature };
            eventStore.emit(feature, data);
            t.true(o[feature] === data);
        });
    }
);
