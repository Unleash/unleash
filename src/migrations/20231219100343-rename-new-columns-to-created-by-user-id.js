'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        ALTER TABLE features RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE feature_types RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE feature_tag RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE feature_strategies RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE role_permission RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE role_user RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE roles RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE users RENAME COLUMN created_by TO created_by_user_id;
        ALTER TABLE api_tokens RENAME COLUMN created_by TO created_by_user_id;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        ALTER TABLE features RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE feature_types RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE feature_tag RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE feature_strategies RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE role_permission RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE role_user RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE roles RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE users RENAME COLUMN created_by_user_id TO created_by;
        ALTER TABLE api_tokens RENAME COLUMN created_by_user_id TO created_by;
        `,
        callback,
    );
};
