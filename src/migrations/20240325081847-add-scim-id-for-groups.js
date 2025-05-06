exports.up = function (db, cb) {
	db.runSql(
		`
  ALTER TABLE groups ADD COLUMN scim_id TEXT;
  CREATE UNIQUE INDEX groups_scim_id_unique_idx ON groups(scim_id) WHERE scim_id IS NOT NULL;
`,
		cb,
	);
};

exports.down = function (db, cb) {
	db.runSql(
		`
  DROP INDEX IF EXISTS groups_scim_id_unique_idx;
  ALTER TABLE groups DROP COLUMN scim_id;`,
		cb,
	);
};
