'use strict';

const test = require('ava');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let db;
let featureToggleStore;

test.before(async () => {
    db = await dbInit('feature_toggle_store_serial', getLogger);
    stores = db.stores;
    featureToggleStore = stores.featureToggleStore;
});

test.after(async () => {
    await db.destroy();
});

test.serial('should not crash for unknown toggle', async t => {
    const project = await featureToggleStore.getProjectId(
        'missing-toggle-name',
    );
    t.is(project, undefined);
});
