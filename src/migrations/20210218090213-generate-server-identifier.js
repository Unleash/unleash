'use strict';

import { v4 as uuidv4 } from 'uuid';

export async function up(db, cb) {
    const instanceId = uuidv4();
    db.runSql(
        `
    INSERT INTO settings(name, content) VALUES ('instanceInfo', json_build_object('id', '${instanceId}'));
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        DELETE FROM settings WHERE name = 'instanceInfo'
        `,
        cb,
    );
};
