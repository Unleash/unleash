
export async function up(db, cb) {
    db.runSql(`
        INSERT INTO permissions (permission, display_name, type) VALUES ('READ_LOGS', 'Read instance logs and login history', 'root');
    `, cb);
}

export async function down(db, cb) {
    db.runSql(`
        DELETE FROM permissions WHERE permission IN ('READ_LOGS');
    `, cb);
}
