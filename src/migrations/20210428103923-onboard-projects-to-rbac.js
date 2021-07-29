const async = require('async');

const DESCRIPTION = {
    OWNER: 'Users with this role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.',
    MEMBER: 'Users with this role within a project are allowed to view, create and update feature toggles, but have limited permissions in regards to managing the projects user access and can not archive or delete the project.',
};
exports.up = function (db, cb) {
    db.runSql(
        'SELECT id AS name from projects WHERE id NOT IN (SELECT DISTINCT project FROM roles WHERE project IS NOT null)',
        (err, results) => {
            if (results && results.rowCount > 0) {
                const projects = results.rows;
                const createProjectRoles = projects.map((p) =>
                    db.runSql.bind(
                        db,
                        `
                WITH project_owner AS (
                    INSERT into roles (name, description, type, project)
                        VALUES ('Owner', '${DESCRIPTION.OWNER}', 'project', '${p.name}')
                        RETURNING id role_id
                )
                INSERT INTO role_permission(role_id, project, permission) VALUES
                    ((SELECT role_id FROM project_owner), '${p.name}', 'UPDATE_PROJECT'),
                    ((SELECT role_id FROM project_owner), '${p.name}', 'DELETE_PROJECT'),
                    ((SELECT role_id FROM project_owner), '${p.name}', 'CREATE_FEATURE'),
                    ((SELECT role_id FROM project_owner), '${p.name}', 'UPDATE_FEATURE'),
                    ((SELECT role_id FROM project_owner), '${p.name}', 'DELETE_FEATURE');

                WITH project_member AS (
                    INSERT into roles (name, description, type, project)
                        VALUES ('Member', '${DESCRIPTION.MEMBER}', 'project', '${p.name}')
                        RETURNING id role_id
                )
                INSERT INTO role_permission(role_id, project, permission) VALUES
                    ((SELECT role_id from project_member), '${p.name}', 'CREATE_FEATURE'),
                    ((SELECT role_id from project_member), '${p.name}', 'UPDATE_FEATURE'),
                    ((SELECT role_id from project_member), '${p.name}', 'DELETE_FEATURE');

                WITH owner_id AS (
                    SELECT id FROM roles WHERE type='project' AND project='${p.name}' AND name = 'Owner'
                )
                INSERT INTO role_user(role_id, user_id) SELECT o.id, u.id FROM owner_id o, users u ON CONFLICT DO NOTHING;

              `,
                    ),
                );

                async.series(createProjectRoles, cb);
            } else {
                cb();
            }
        },
    );
};

exports.down = function (db, cb) {
    cb(); // Can't really roll this back since more roles could have been added afterwards
};
