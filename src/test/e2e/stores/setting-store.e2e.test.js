'use strict';

const test = require('ava');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let db;

test.before(async () => {
    db = await dbInit('setting_store_serial', getLogger);
    stores = db.stores;
});

test.after(async () => {
    await db.destroy();
});

test.serial('should have api secret stored', async t => {
    const secret = await stores.settingStore.get('unleash.secret');
    t.assert(secret);
});

test.serial('should insert arbitrary value', async t => {
    const value = { b: 'hello' };
    await stores.settingStore.insert('unleash.custom', value);
    const ret = await stores.settingStore.get('unleash.custom');
    t.deepEqual(ret, value);
});
