/* eslint camelcase: "off" */
'use strict';

/**
 * Maps from storage format to client format
 * @param {Object} row  storage format of Metrics
 */
const mapRow = row => ({
    id: row.id,
    createdAt: row.created_at,
    metrics: row.metrics,
});

module.exports.mapRow = mapRow;
