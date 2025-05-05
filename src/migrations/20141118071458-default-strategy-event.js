
export async function up(db, callback) {
    db.runSql(
        `
INSERT INTO events(type, created_by, data) 
VALUES ('strategy-created', 'migration', '{"name":"default","description":"Default on or off Strategy."}');
       `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
delete from events where type='strategy-created' and data->>'name' = 'default';`,
        callback,
    );
};
