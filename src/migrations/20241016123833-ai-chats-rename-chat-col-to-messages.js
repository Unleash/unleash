export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE ai_chats RENAME COLUMN chat TO messages;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE ai_chats RENAME COLUMN messages TO chat;
        `,
        cb,
    );
};
