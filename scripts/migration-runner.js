var fs   = require('fs');
var util = require('util');
var path = require('path');

var runMigration = function(path, db, callback) {
    db.runSql(fs.readFileSync(path, { encoding: 'utf8' }), callback);
};

module.exports = {
    create: function (name) {
        var format = path.resolve(__dirname, '../migrations/sql/%s.%s.sql');

        return {
            up: runMigration.bind(null, util.format(format, name, 'up')),
            down: runMigration.bind(null, util.format(format, name, 'down'))
        };
    }
};
