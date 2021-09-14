import { EventEmitter } from 'events';
import { addEventHook } from './event-hook';
import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} from './types/events';

const eventStore = new EventEmitter();
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
