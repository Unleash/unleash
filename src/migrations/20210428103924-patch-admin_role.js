'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        DO $$
        declare
        begin
                WITH admin AS (
                    SELECT * FROM roles WHERE name in ('Admin', 'Super User') LIMIT 1
                )
                INSERT into role_user(role_id, user_id)
                VALUES 
                    ((select id from admin), (select id FROM users where username='admin' LIMIT 1)); 

        EXCEPTION WHEN OTHERS THEN
            raise notice 'Ignored';
        end;
        $$;`,
        cb,
    );
};

exports.down = function (db, cb) {
    // We can't just remove roles for users as we don't know if there has been any manual additions.
    cb();
};
