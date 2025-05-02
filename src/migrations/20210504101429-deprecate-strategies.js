export async function up(db, cb) {
    db.runSql(
        `
      UPDATE strategies
      SET deprecated = true, built_in = 0
      WHERE name = 'gradualRolloutSessionId' OR name = 'gradualRolloutUserId'
      OR name = 'gradualRolloutRandom'
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
      UPDATE strategies
      SET deprecated = false, built_in = 1
      WHERE name = 'gradualRolloutSessionId' OR name = 'gradualRolloutUserId'
      OR name = 'gradualRolloutRandom'
    `,
        cb,
    );
};
