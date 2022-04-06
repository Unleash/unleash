'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        DO $$
        declare
        begin
                WITH editor AS (
                    SELECT * FROM roles WHERE name in ('Editor', 'Regular') LIMIT 1
                )

                INSERT INTO role_permission(role_id, project, permission)
                VALUES
                    ((SELECT id from editor), '', 'CREATE_STRATEGY'),
                    ((SELECT id from editor), '', 'UPDATE_STRATEGY'),
                    ((SELECT id from editor), '', 'DELETE_STRATEGY'),
        
                    ((SELECT id from editor), '', 'UPDATE_APPLICATION'),
        
                    ((SELECT id from editor), '', 'CREATE_CONTEXT_FIELD'),
                    ((SELECT id from editor), '', 'UPDATE_CONTEXT_FIELD'),
                    ((SELECT id from editor), '', 'DELETE_CONTEXT_FIELD'),
                    
                    ((SELECT id from editor), '', 'CREATE_PROJECT'),
        
                    ((SELECT id from editor), '', 'CREATE_ADDON'),
                    ((SELECT id from editor), '', 'UPDATE_ADDON'),
                    ((SELECT id from editor), '', 'DELETE_ADDON'),
                
                    ((SELECT id from editor), 'default', 'UPDATE_PROJECT'),
                    ((SELECT id from editor), 'default', 'DELETE_PROJECT'),
                    ((SELECT id from editor), 'default', 'CREATE_FEATURE'),
                    ((SELECT id from editor), 'default', 'UPDATE_FEATURE'),
                    ((SELECT id from editor), 'default', 'DELETE_FEATURE');
                
                -- Clean up duplicates
                DELETE FROM role_permission p1
                USING           role_permission p2
                WHERE  p1.created_at < p2.created_at   -- select the "older" ones
                AND  p1.project    = p2.project       -- list columns that define duplicates
                AND  p1.permission = p2.permission;
        EXCEPTION WHEN OTHERS THEN
            raise notice 'Ignored';
        end;
        $$;`,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
