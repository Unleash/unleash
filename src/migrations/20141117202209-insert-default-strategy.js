
export async function up(db, callback) {
    db.runSql(
        `
INSERT INTO strategies(name, description) 
VALUES ('default', 'Default on/off strategy.');
       `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
DELETE FROM strategies where name='default';`,
        callback,
    );
};
