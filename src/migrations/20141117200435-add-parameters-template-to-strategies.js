
export async function up(db, callback) {
    db.runSql(
        'ALTER TABLE strategies ADD "parameters_template" json;',
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        'ALTER TABLE strategies DROP COLUMN "parameters_template";',
        callback,
    );
};
