exports.up = function (db, cb) {
    db.runSql(
        `
        DELETE FROM role_permission 
        WHERE permission_id IN (
                    SELECT id FROM permissions WHERE permission IN (
                        'DELETE_SEGMENT',
                        'UPDATE_SEGMENT',
                        'CREATE_SEGMENT'
                    )) 
        AND role_id IN (SELECT id FROM roles r WHERE r.name = 'Admin');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        insert into role_permission (role_id, permission_id)
            select
                r.id as role_id,
                p.id as permission_id
            from roles r
            cross join permissions p
            where r.name = 'Admin'
            and p.permission in  (
                'CREATE_SEGMENT',
                'UPDATE_SEGMENT',
                'DELETE_SEGMENT'
            );
        `,
        cb,
    );
};
