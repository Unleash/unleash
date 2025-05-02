'use strict';

export async function up(db, cb) {
    db.runSql(`
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_MAINTENANCE_MODE', 'Change maintenance mode state', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_INSTANCE_BANNERS', 'Change instance banners', 'root');
    `, cb);
}

export async function down(db, cb) {
    db.runSql(`
        DELETE FROM permissions WHERE permission IN ('UPDATE_MAINTENANCE_MODE', 'UPDATE_INSTANCE_BANNERS');
    `, cb);
}
