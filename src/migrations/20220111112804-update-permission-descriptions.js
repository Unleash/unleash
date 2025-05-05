exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE permissions SET display_name = 'Admin' WHERE permission = 'ADMIN';
        UPDATE permissions SET display_name = 'Create feature toggles' WHERE permission = 'CREATE_FEATURE';
        UPDATE permissions SET display_name = 'Create activation strategies' WHERE permission = 'CREATE_STRATEGY';
        UPDATE permissions SET display_name = 'Create addons' WHERE permission = 'CREATE_ADDON';
        UPDATE permissions SET display_name = 'Delete addons' WHERE permission = 'DELETE_ADDON';
        UPDATE permissions SET display_name = 'Update addons' WHERE permission = 'UPDATE_ADDON';
        UPDATE permissions SET display_name = 'Update feature toggles' WHERE permission = 'UPDATE_FEATURE';
        UPDATE permissions SET display_name = 'Delete feature toggles' WHERE permission = 'DELETE_FEATURE';
        UPDATE permissions SET display_name = 'Update applications' WHERE permission = 'UPDATE_APPLICATION';
        UPDATE permissions SET display_name = 'Update tag types' WHERE permission = 'UPDATE_TAG_TYPE';
        UPDATE permissions SET display_name = 'Delete tag types' WHERE permission = 'DELETE_TAG_TYPE';
        UPDATE permissions SET display_name = 'Create projects' WHERE permission = 'CREATE_PROJECT';
        UPDATE permissions SET display_name = 'Update project' WHERE permission = 'UPDATE_PROJECT';
        UPDATE permissions SET display_name = 'Delete project' WHERE permission = 'DELETE_PROJECT';
        UPDATE permissions SET display_name = 'Update strategies' WHERE permission = 'UPDATE_STRATEGY';
        UPDATE permissions SET display_name = 'Delete strategies' WHERE permission = 'DELETE_STRATEGY';
        UPDATE permissions SET display_name = 'Update context fields' WHERE permission = 'UPDATE_CONTEXT_FIELD';
        UPDATE permissions SET display_name = 'Create context fields' WHERE permission = 'CREATE_CONTEXT_FIELD';
        UPDATE permissions SET display_name = 'Delete context fields' WHERE permission = 'DELETE_CONTEXT_FIELD';
        UPDATE permissions SET display_name = 'Read roles' WHERE permission = 'READ_ROLE';
        UPDATE permissions SET display_name = 'Update roles' WHERE permission = 'UPDATE_ROLE';
        UPDATE permissions SET display_name = 'Update API tokens' WHERE permission = 'UPDATE_API_TOKEN';
        UPDATE permissions SET display_name = 'Create API tokens' WHERE permission = 'CREATE_API_TOKEN';
        UPDATE permissions SET display_name = 'Delete API tokens' WHERE permission = 'DELETE_API_TOKEN';
        UPDATE permissions SET display_name = 'Create activation strategies' WHERE permission = 'CREATE_FEATURE_STRATEGY';
        UPDATE permissions SET display_name = 'Update activation strategies' WHERE permission = 'UPDATE_FEATURE_STRATEGY';
        UPDATE permissions SET display_name = 'Delete activation strategies' WHERE permission = 'DELETE_FEATURE_STRATEGY';
        UPDATE permissions SET display_name = 'Enable/disable toggles in this environment' WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT';
        UPDATE permissions SET display_name = 'Create/edit variants' WHERE permission = 'UPDATE_FEATURE_VARIANTS';

      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
`,
        cb,
    );
};
