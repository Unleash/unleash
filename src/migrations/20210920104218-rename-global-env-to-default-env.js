'use strict';

const up = function (db, cb) {
    db.runSql(
        `
       INSERT INTO environments(name, display_name, protected, sort_order, type) VALUES ('default', 'Default Environment', true, 1, 'production');
       ALTER TABLE feature_strategies ALTER COLUMN environment SET DEFAULT 'default';
       ALTER TABLE feature_environments ALTER COLUMN environment SET DEFAULT 'default';
       UPDATE feature_strategies SET environment = 'default' WHERE environment = ':global:';
       UPDATE feature_environments SET environment = 'default' WHERE environment = ':global:';
       UPDATE project_environments SET environment_name = 'default' WHERE environment_name = ':global:';
       DELETE FROM environments WHERE name = ':global:';
  `,
        cb,
    );
};

const down = function (db, cb) {
    db.runSql(
        `
        INSERT INTO environments(name, display_name, protected, type) VALUES (':global:', 'Across all environments', true, 'production');
        ALTER TABLE feature_strategies ALTER COLUMN environment SET DEFAULT ':global:';
        ALTER TABLE feature_environments ALTER COLUMN environment SET DEFAULT ':global:';
        UPDATE feature_strategies SET environment = ':global:' WHERE environment = 'default';
        UPDATE feature_environments SET environment = ':global:' WHERE environment = 'default';
        UPDATE project_environments SET environment_name = ':global:' WHERE environment_name = 'default';
        DELETE FROM environments WHERE name = 'default';
        `,
        cb,
    );
};

module.exports = { up, down };
