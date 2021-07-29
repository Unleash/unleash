'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE strategies ADD COLUMN display_name text;
    UPDATE strategies SET display_name = 'Standard', description = 'The standard strategy is strictly on / off for your entire userbase.' WHERE name = 'default';
    UPDATE strategies SET display_name = 'Gradual rollout', description = 'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.' WHERE name = 'flexibleRollout';
    UPDATE strategies SET display_name = 'UserIDs', description = 'Enable the feature for a specific set of userIds.' WHERE name = 'userWithId';
    UPDATE strategies SET display_name = 'IPs', description = 'Enable the feature for a specific set of IP addresses.' WHERE name = 'remoteAddress';
    UPDATE strategies SET display_name = 'Hosts', description = 'Enable the feature for a specific set of hostnames.' WHERE name = 'applicationHostname';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('ALTER TABLE strategies DROP COLUMN display_name;', cb);
};
