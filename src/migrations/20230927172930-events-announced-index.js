
export async function up(db, callback) {
    db.runSql(
        `
        UPDATE events set announced = false where announced IS NULL;
        ALTER TABLE events ALTER COLUMN announced SET NOT NULL;
        ALTER TABLE events ALTER COLUMN announced SET DEFAULT false;
        CREATE INDEX events_unannounced_idx ON events(announced) WHERE announced = false;
        `,
        callback(),
    );
};

export async function down(db, callback) {
    callback();
};
