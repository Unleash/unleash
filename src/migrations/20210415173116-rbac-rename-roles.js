'use strict';

const DESCRIPTION = {
    EDITOR: 'Users with this role have access most features in Unleash, but can not manage users and roles in the global scope. If a user with a global regular role creates a project, they will become a project admin and receive superuser rights within the context of that project.',
    OWNER: 'Users with this role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.',
    MEMBER: 'Users with this role within a project are allowed to view, create and update feature toggles, but have limited permissions in regards to managing the projects user access and can not archive or delete the project.',
};

exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE roles set name = 'Editor', description = '${DESCRIPTION.EDITOR}' where name = 'Regular' AND type = 'root';
    UPDATE roles set name = 'Viewer' where name = 'Read' AND type = 'root';
    UPDATE roles set name = 'Owner', description = '${DESCRIPTION.OWNER}' where name = 'Admin' AND type = 'project';
    UPDATE roles set name = 'Member', description = '${DESCRIPTION.MEMBER}' where name = 'Regular' AND type = 'project';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    UPDATE roles set name = 'Regular' where name = 'Editor' AND type = 'root';
    UPDATE roles set name = 'Read' where name = 'Viewer' AND type = 'root';
    UPDATE roles set name = 'Admin' where name = 'Owner' AND type = 'project';
    UPDATE roles set name = 'Regular' where name = 'Member' AND type = 'project';
    `,
        cb,
    );
};
