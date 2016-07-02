'use strict';
function extractUsername (req) {
    return req.cookies.username || 'unknown';
}
module.exports = extractUsername;
