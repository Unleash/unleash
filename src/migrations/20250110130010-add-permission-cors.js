
export async function up(db, cb) {
    db.runSql(`
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_CORS', 'Update CORS settings', 'root');
    `, cb);
}

export async function down(db, cb) {
    db.runSql(`
        DELETE FROM permissions WHERE permission IN ('UPDATE_CORS');
    `, cb);
}
