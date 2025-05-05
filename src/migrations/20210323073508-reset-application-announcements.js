
export async function up(db, cb) {
    db.runSql(
        `
    DELETE FROM events WHERE type = 'application-created';
    UPDATE client_applications SET announced = false;
  `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
