/* eslint camelcase: "off" */
'use strict';

/**
 * Maps from storage format to client format
 * @param {Object} row  storage format of Application
 */
const mapRow = row => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    strategies: row.strategies,
    url: row.url,
    color: row.color,
    icon: row.icon,
});

/**
 * Maps from client format to storage format as a PATCH with mandatory fields
 * @param {Object} input    client format of Application
 * @param {Object} old      client format of Application
 */
const remapRow = (input, old = {}) => ({
    app_name: input.appName,
    updated_at: input.updatedAt,
    description: input.description || old.description,
    url: input.url || old.url,
    color: input.color || old.color,
    icon: input.icon || old.icon,
    strategies: JSON.stringify(input.strategies || old.strategies),
});

module.exports.mapRow = mapRow;
module.exports.remapRow = remapRow;
