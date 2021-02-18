'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
    INSERT INTO settings(name, content) VALUES ('instanceInfo', json_build_object('id', gen_random_uuid()));
  `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        DROP FROM settings WHERE name = 'instanceInfo'
        `,
        cb,
    );
};
