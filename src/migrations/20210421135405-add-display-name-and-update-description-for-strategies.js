'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
    ALTER TABLE strategies ADD COLUMN display_name text;
    UPDATE strategies SET display_name = 'Standard' WHERE name = 'default';
    UPDATE strategies SET display_name = 'Gradual rollout' WHERE name = 'flexibleRollout';
    UPDATE strategies SET display_name = 'UserIDs' WHERE name = 'userWithId';
    UPDATE strategies SET display_name = 'IPs' WHERE name = 'remoteAddress';
    UPDATE strategies SET display_name = 'Hosts' WHERE name = 'applicationHostname';
  `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`ALTER TABLE strategies REMOVE COLUMN display_name;`, cb);
};
