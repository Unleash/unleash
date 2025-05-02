export async function up(db, cb) {
    db.runSql(
        `
            ALTER TABLE feature_tag
                DROP CONSTRAINT feature_tag_feature_name_tag_type_tag_value_key;
            ALTER TABLE feature_tag
                ADD PRIMARY KEY (feature_name, tag_type, tag_value);
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `ALTER TABLE feature_tag
        DROP constraint feature_tag_pkey;
    ALTER TABLE feature_tag
        ADD CONSTRAINT feature_tag_feature_name_tag_type_tag_value_key UNIQUE (feature_name, tag_type, tag_value)`,
        cb,
    );
};

export const _meta = {
    version: 1,
};
