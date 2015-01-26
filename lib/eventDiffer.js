var eventType     = require('./eventType');
var diff          = require('deep-diff').diff;

var strategyTypes = [
    eventType.strategyCreated,
    eventType.strategyDeleted
];

var featureTypes  = [
    eventType.featureCreated,
    eventType.featureUpdated,
    eventType.featureArchive,
    eventType.featureRevive
];

function baseTypeFor(event) {
    if (featureTypes.indexOf(event.type) !== -1) {
        return 'features';
    } else if (strategyTypes.indexOf(event.type) !== -1) {
        return 'strategies';
    } else {
        throw new Error('unknown event type: ' + JSON.stringify(event));
    }
}

function groupByBaseTypeAndName(events) {
    var groups = {};

    events.forEach(function (event) {
        var baseType = baseTypeFor(event);

        groups[baseType] = groups[baseType] || {};
        groups[baseType][event.data.name] = groups[baseType][event.data.name] || [];

        groups[baseType][event.data.name].push(event);
    });

    return groups;
}

function eachConsecutiveEvent(events, callback) {
    var groups = groupByBaseTypeAndName(events);

    Object.keys(groups).forEach(function (baseType) {
        var group = groups[baseType];

        Object.keys(group).forEach(function (name) {
            var events = group[name];
            var left, right, i, l;
            for (i = 0, l = events.length; i < l; i++) {
                left  = events[i];
                right = events[i + 1];

                callback(left, right);
            }
        });
    });
}

function addDiffs(events) {
    eachConsecutiveEvent(events, function (left, right) {
        if (right) {
            left.diffs = diff(right.data, left.data);
            left.diffs = left.diffs || [];
        } else {
            left.diffs = null;
        }
    });
}


module.exports = {
    addDiffs: addDiffs
};