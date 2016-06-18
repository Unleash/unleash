'use strict';
const fs   = require('fs');
const util = require('util');
const path = require('path');

const runMigration = function(path, db, callback) {
    db.runSql(fs.readFileSync(path, { encoding: 'utf8' }), callback);
};

module.exports = {
    create(name) {
        const format = path.resolve(__dirname, '../migrations/sql/%s.%s.sql');

        return {
            up: runMigration.bind(null, util.format(format, name, 'up')),
            down: runMigration.bind(null, util.format(format, name, 'down'))
        };
    }
};
