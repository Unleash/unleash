'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
    ALTER TABLE client_instances ADD PRIMARY KEY (app_name, instance_id);
  `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE client_instances DROP CONSTRAINT client_instances_pkey;
        DROP INDEX client_instance_pkey
    `,
        cb,
    );
};
