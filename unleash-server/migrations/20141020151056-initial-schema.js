var fs   = require('fs');
var util = require('util');
var path = require('path').resolve(__dirname, 'sql/001-initial-schema.%s.sql');

exports.up = function(db, callback) {
    var content = fs.readFileSync(util.format(path, 'up'), {encoding: 'utf8'});
    db.runSql(content, callback);
};

exports.down = function(db, callback) {
    db.runSql(fs.readFileSync(util.format(path, 'down'), {encoding: 'utf8'}), callback);
};
