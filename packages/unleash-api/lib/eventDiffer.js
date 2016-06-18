'use strict';
const eventType     = require('./eventType');
const diff          = require('deep-diff').diff;

const strategyTypes = [
    eventType.strategyCreated,
    eventType.strategyDeleted,
];

const featureTypes  = [
    eventType.featureCreated,
    eventType.featureUpdated,
    eventType.featureArchived,
    eventType.featureRevived,
];

function baseTypeFor(event) {
    if (featureTypes.indexOf(event.type) !== -1) {
        return 'features';
    } else if (strategyTypes.indexOf(event.type) !== -1) {
        return 'strategies';
    }
    throw new Error(`unknown event type: ${JSON.stringify(event)}`);
}

function groupByBaseTypeAndName(events) {
    const groups = {};

    events.forEach(event => {
        const baseType = baseTypeFor(event);

        groups[baseType] = groups[baseType] || {};
        groups[baseType][event.data.name] = groups[baseType][event.data.name] || [];

        groups[baseType][event.data.name].push(event);
    });

    return groups;
}

function eachConsecutiveEvent(events, callback) {
    const groups = groupByBaseTypeAndName(events);

    Object.keys(groups).forEach(baseType => {
        const group = groups[baseType];

        Object.keys(group).forEach(name => {
            const currentEvents = group[name];
            let left;
            let right;
            let i;
            let l;
            for (i = 0, l = currentEvents.length; i < l; i++) {
                left  = currentEvents[i];
                right = currentEvents[i + 1];

                callback(left, right);
            }
        });
    });
}

function addDiffs(events) {
    eachConsecutiveEvent(events, (left, right) => {
        if (right) {
            left.diffs = diff(right.data, left.data);
            left.diffs = left.diffs || [];
        } else {
            left.diffs = null;
        }
    });
}


module.exports = {
    addDiffs,
};
