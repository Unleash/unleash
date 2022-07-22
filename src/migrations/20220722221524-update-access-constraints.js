'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE role_user DROP CONSTRAINT role_user_pkey;
            ALTER TABLE role_user ADD PRIMARY KEY (user_id, project);
            ALTER TABLE group_role DROP CONSTRAINT group_role_pkey;
            ALTER TABLE group_role ADD PRIMARY KEY (group_id, project);
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE role_user DROP CONSTRAINT role_user_pkey;
            ALTER TABLE role_user ADD PRIMARY KEY (user_id, role_id, project);
            ALTER TABLE group_role DROP CONSTRAINT group_role_pkey;
            ALTER TABLE group_role ADD PRIMARY KEY (group_id, role_id, project);
        `,
        callback,
    );
};
