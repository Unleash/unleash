
export async function up(db, callback) {
    db.runSql('ALTER TABLE features ADD "description" text;', callback);
};

export async function down(db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "description";', callback);
};
