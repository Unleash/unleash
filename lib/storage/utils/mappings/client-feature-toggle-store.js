'use strict';

const NotFoundError = require('../../../error/notfound-error');

/**
 * Maps from storage format to client format
 * @param {Object} row  storage format of FeatureToggle
 */
const mapRow = function(row) {
    if (!row) {
        throw new NotFoundError('No feature toggle found');
    }
    return {
        name: row.name,
        description: row.description,
        enabled: row.enabled > 0,
        strategies: row.strategies,
        variants: row.variants,
        createdAt: row.created_at,
    };
};

/**
 * Maps from client format to storage format with mandatory fields
 * @param {Object} data    client format of FeatureToggle
 */
const eventDataToRow = data => ({
    name: data.name,
    description: data.description,
    enabled: data.enabled ? 1 : 0,
    archived: data.archived ? 1 : 0,
    strategies: JSON.stringify(data.strategies),
    variants: data.variants ? JSON.stringify(data.variants) : null,
    created_at: data.createdAt, // eslint-disable-line
});

module.exports.mapRow = mapRow;
module.exports.eventDataToRow = eventDataToRow;
