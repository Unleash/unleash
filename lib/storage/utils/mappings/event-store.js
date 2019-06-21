'use strict';

const rowToEvent = row => ({
    id: row.id,
    type: row.type,
    createdBy: row.created_by,
    createdAt: row.created_at,
    data: row.data,
});

module.exports.rowToEvent = rowToEvent;
