exports.up = function (db, cb) {
	db.runSql(
		`
        UPDATE role_permission SET environment = null where environment = '';
        DELETE FROM role_permission WHERE environment IS NOT NULL AND environment NOT IN (SELECT name FROM environments);
        ALTER TABLE role_permission ADD CONSTRAINT fk_role_permission_environment FOREIGN KEY (environment) REFERENCES environments(name) ON DELETE CASCADE;
        `,
		cb,
	);
};

exports.down = function (db, cb) {
	db.runSql(
		`
        ALTER TABLE role_permission
        DROP CONSTRAINT IF EXISTS fk_role_permission_environment;
        `,
		cb,
	);
};
