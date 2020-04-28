'use strict';

function extractUsername(req) {
    return req.user ? req.user.email || req.user.username : 'unknown';
}

module.exports = extractUsername;
