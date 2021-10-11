'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE client_instances DROP CONSTRAINT client_instances_pkey;
    ALTER TABLE client_instances ADD COLUMN environment varchar(255) NOT NULL DEFAULT 'default';
    ALTER TABLE client_instances ADD CONSTRAINT client_instances_pkey PRIMARY KEY (app_name, environment, instance_id);
    CREATE INDEX client_instances_environment_idx ON client_instances(environment);
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
      DROP INDEX client_instances_environment_idx;
    ALTER TABLE client_instances DROP CONSTRAINT client_instances_pkey;
    ALTER TABLE client_instances ADD CONSTRAINT client_instances_pkey PRIMARY KEY (app_name, instance_id);
    ALTER TABLE client_instances DROP COLUMN environment;
  `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
