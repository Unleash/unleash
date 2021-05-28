'use strict';

const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let db;

beforeAll(async () => {
    db = await dbInit('setting_store_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

test('should have api secret stored', async () => {
    const secret = await stores.settingStore.get('unleash.secret');
    expect(secret).toBeDefined();
});

test('should insert arbitrary value', async () => {
    const value = { b: 'hello' };
    await stores.settingStore.insert('unleash.custom', value);
    const ret = await stores.settingStore.get('unleash.custom');
    expect(ret).toEqual(value);
});
