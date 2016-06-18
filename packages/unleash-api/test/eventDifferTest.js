'use strict';
const eventDiffer = require('../lib/eventDiffer');
const eventType   = require('../lib/eventType');
const assert      = require('assert');

describe('eventDiffer', () => {
    it('fails if events include an unknown event type', () => {
        const events = [
            { type: eventType.featureCreated, data: {} },
            { type: 'unknown-type', data: {} }
        ];

        assert.throws(() => {
            eventDiffer.addDiffs(events);
        });
    });

    it('diffs a feature-update event', () => {
        const name = 'foo';
        const desc = 'bar';

        const events = [
            {
                type: eventType.featureUpdated,
                data: { name, description: desc, strategy: 'default', enabled: true, parameters: { value: 2 } }
            },
            {
                type: eventType.featureCreated,
                data: { name, description: desc, strategy: 'default', enabled: false, parameters: { value: 1 } }
            }
        ];

        eventDiffer.addDiffs(events);

        assert.deepEqual(events[0].diffs, [
            { kind: 'E', path: ["enabled"], lhs: false, rhs: true },
            { kind: 'E', path: ["parameters", "value"], lhs: 1, rhs: 2 }
        ]);

        assert.strictEqual(events[1].diffs, null);
    });

    it('diffs only against features with the same name', () => {
        const events = [
            {
                type: eventType.featureUpdated,
                data: { name: 'bar', description: 'desc', strategy: 'default', enabled: true, parameters: {} }
            },
            {
                type: eventType.featureUpdated,
                data: { name: 'foo', description: 'desc', strategy: 'default', enabled: false, parameters: {} }
            },
            {
                type: eventType.featureCreated,
                data: { name: 'bar', description: 'desc', strategy: 'default', enabled: false, parameters: {} }
            },
            {
                type: eventType.featureCreated,
                data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} }
            }
        ];

        eventDiffer.addDiffs(events);

        assert.strictEqual(events[0].diffs[0].rhs, true);
        assert.strictEqual(events[1].diffs[0].rhs, false);
        assert.strictEqual(events[2].diffs, null);
        assert.strictEqual(events[3].diffs, null);
    });

    it('sets an empty array of diffs if nothing was changed', () => {
        const events = [
            {
                type: eventType.featureUpdated,
                data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} }
            },
            {
                type: eventType.featureCreated,
                data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} }
            }
        ];

        eventDiffer.addDiffs(events);
        assert.deepEqual(events[0].diffs, []);
    });

    it('sets diffs to null if there was nothing to diff against', () => {
        const events = [
            {
                type: eventType.featureUpdated,
                data: { name: 'foo', description: 'desc', strategy: 'default', enabled: true, parameters: {} }
            }
        ];

        eventDiffer.addDiffs(events);
        assert.strictEqual(events[0].diffs, null);
    });
});
