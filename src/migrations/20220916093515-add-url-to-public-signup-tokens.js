
export async function up(db, callback) {
    db.runSql(
        `
            ALTER table public_signup_tokens
                ADD COLUMN IF NOT EXISTS url text
       `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            ALTER table public_signup_tokens
                DROP COLUMN url
        `,
        callback,
    );
};
