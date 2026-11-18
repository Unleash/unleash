exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE release_plan_definitions
            DROP CONSTRAINT IF EXISTS release_plan_definitions_release_plan_template_id_fkey;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    // NOT VALID: plans can reference templates deleted while the constraint was gone
    db.runSql(
        `
        ALTER TABLE release_plan_definitions
            ADD CONSTRAINT release_plan_definitions_release_plan_template_id_fkey
            FOREIGN KEY (release_plan_template_id)
            REFERENCES release_plan_definitions(id)
            ON DELETE CASCADE
            NOT VALID;
        `,
        cb,
    );
};
