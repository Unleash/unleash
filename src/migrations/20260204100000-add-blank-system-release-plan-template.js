'use strict';

// This template is used for inline milestone creation. It has no milestones
// by default - milestones are added directly by the user.
const TEMPLATE_NAME = '__blank__';
const TEMPLATE_ID = '01JPWJT5Z6Q9K8XVYBM3CRH4VN';

exports.up = function (db, callback) {
    db.runSql(
        `
        INSERT INTO release_plan_definitions (id, discriminator, name, description, created_by_user_id)
        SELECT '${TEMPLATE_ID}', 'template', '${TEMPLATE_NAME}',
               'System template used for inline milestone creation.',
               -1337
        WHERE NOT EXISTS (
            SELECT 1 FROM release_plan_definitions
            WHERE name = '${TEMPLATE_NAME}' AND discriminator = 'template'
        );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `DELETE FROM release_plan_definitions WHERE id = '${TEMPLATE_ID}'`,
        callback,
    );
};
