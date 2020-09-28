/* eslint-disable no-param-reassign */

'use strict';

const { diff } = require('deep-diff');
const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_UPDATED,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_IMPORT,
    DROP_FEATURES,
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_DELETED,
} = require('./event-type');

const strategyTypes = [
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_UPDATED,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
];

const featureTypes = [
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_IMPORT,
    DROP_FEATURES,
];

const contextTypes = [
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_DELETED,
    CONTEXT_FIELD_UPDATED,
];

const projectTypes = [PROJECT_CREATED, PROJECT_UPDATED, PROJECT_DELETED];

function baseTypeFor(event) {
    if (featureTypes.indexOf(event.type) !== -1) {
        return 'features';
    }
    if (strategyTypes.indexOf(event.type) !== -1) {
        return 'strategies';
    }
    if (contextTypes.indexOf(event.type) !== -1) {
        return 'context';
    }
    if (projectTypes.indexOf(event.type) !== -1) {
        return 'project';
    }
    throw new Error(`unknown event type: ${JSON.stringify(event)}`);
}

function groupByBaseTypeAndName(events) {
    const groups = {};

    events.forEach(event => {
        const baseType = baseTypeFor(event);

        groups[baseType] = groups[baseType] || {};
        groups[baseType][event.data.name] =
            groups[baseType][event.data.name] || [];

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
                left = currentEvents[i];
                right = currentEvents[i + 1];

                callback(left, right);
            }
        });
    });
}

function addDiffs(events) {
    // TODO: no-param-reassign
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
