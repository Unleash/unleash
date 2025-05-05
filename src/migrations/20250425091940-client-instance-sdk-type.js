
export async function up(db, callback) {
    db.runSql(
        `ALTER TABLE client_instances ADD COLUMN sdk_type varchar(255);`,
        callback
    );
};

export async function down(db, callback) {
    db.runSql(
        `ALTER TABLE client_instances DROP COLUMN sdk_type;`,
        callback
    );
};
