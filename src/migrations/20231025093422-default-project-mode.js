'use strict';

exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE project_settings
            ALTER COLUMN project_mode SET DEFAULT 'open';

        UPDATE project_settings
            SET project_mode = 'open'
                WHERE project_mode NOT IN ('open', 'protected', 'private') OR project_mode IS NULL;

        ALTER TABLE project_settings
            ALTER COLUMN project_mode SET NOT NULL;

        ALTER TABLE project_settings
            ADD CONSTRAINT project_settings_project_mode_values
                CHECK (project_mode IN ('open', 'protected', 'private'));
    `, cb);
};

exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE project_settings
            ALTER COLUMN project_mode DROP DEFAULT;

        ALTER TABLE project_settings
            ALTER COLUMN project_mode DROP NOT NULL;

        ALTER TABLE project_settings
            DROP CONSTRAINT project_settings_project_mode_values;
    `, cb);
};
