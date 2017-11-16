'use strict';

function extractUsername(req) {
    return req.user ? req.user.email : 'unknown';
}

module.exports = extractUsername;
