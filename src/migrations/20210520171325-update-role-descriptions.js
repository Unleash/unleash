'use strict';

const DESCRIPTION = {
    EDITOR: 'Users with the editor role have access to most features in Unleash, but can not manage users and roles in the global scope. Editors will be added as project owner when creating projects and get superuser rights within the context of these projects.',
    ADMIN: 'Users with the global admin role have superuser access to Unleash and can perform any operation within the unleash platform.',
    VIEWER: 'Users with this role can only read root resources in Unleash. The viewer can be added to specific projects as project member.',
};

exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE roles set description = '${DESCRIPTION.EDITOR}' where name = 'Editor' AND type = 'root';
    UPDATE roles set description = '${DESCRIPTION.ADMIN}' where name = 'Admin' AND type = 'root';
    UPDATE roles set description = '${DESCRIPTION.VIEWER}' where name = 'Viewer' AND type = 'root';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    `,
        cb,
    );
};
