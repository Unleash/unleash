exports.up = function (db, cb) {
    db.runSql(`
        UPDATE roles
        SET description = 'Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature flags within the project, and control advanced project features like archiving and deleting the project.'
        WHERE name = 'Owner'
          AND type = 'project';

        UPDATE roles
        SET description = 'Users with the project member role are allowed to view, create, and update feature flags within a project, but have limited permissions in regards to managing the project''s user access and can not archive or delete the project.'
        WHERE name = 'Member'
          AND type = 'project';

    `, cb);
};

exports.down = function (db, cb) {
    db.runSql(
        `
            UPDATE roles
            SET description = 'Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.'
            WHERE name = 'Owner'
              AND type = 'project';

            UPDATE roles
            SET description = 'Users with the project member role are allowed to view, create, and update feature toggles within a project, but have limited permissions in regards to managing the project''s user access and can not archive or delete the project.'
            WHERE name = 'Member'
              AND type = 'project';

        `,
        cb,
    );
};
