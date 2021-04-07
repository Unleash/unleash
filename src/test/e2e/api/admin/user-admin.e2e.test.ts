/* eslint-disable import/no-named-as-default */
import test from 'ava';
import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import User from '../../../../lib/user';
import UserStore from '../../../../lib/db/user-store';

let stores;
let db;

let userStore: UserStore;

test.before(async () => {
    db = await dbInit('user_admin_api_serial', getLogger);
    stores = db.stores;
    userStore = stores.userStore;
});

test.after(async () => {
    await db.destroy();
});

test.afterEach.always(async () => {
    const users = await userStore.getAll();
    const deleteAll = users.map((u: User) => userStore.delete(u.id));
    await Promise.all(deleteAll);
});

test.serial('returns empty list of users', async t => {
    t.plan(1);
    const request = await setupApp(stores);
    return request
        .get('/api/admin/user-admin')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.users.length, 0);
        });
});

test.serial('creates and returns all users', async t => {
    t.plan(2);
    const request = await setupApp(stores);

    const createUserRequests = [...Array(20).keys()].map(i =>
        request
            .post('/api/admin/user-admin')
            .send({
                email: `some${i}@getunelash.ai`,
                name: `Some Name ${i}`,
                rootRole: 'Regular',
            })
            .set('Content-Type', 'application/json'),
    );

    await Promise.all(createUserRequests);

    return request
        .get('/api/admin/user-admin')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            t.is(res.body.users.length, 20);
            t.is(res.body.users[2].rootRole, 'Regular');
        });
});

test.serial('creates regular-user without password', async t => {
    t.plan(3);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/user-admin')
        .send({
            email: 'some@getunelash.ai',
            name: 'Some Name',
            rootRole: 'Regular',
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            t.is(res.body.email, 'some@getunelash.ai');
            t.is(res.body.rootRole, 'Regular');
            t.truthy(res.body.id);
        });
});

test.serial('creates admin-user with password', async t => {
    t.plan(6);
    const request = await setupApp(stores);
    const { body } = await request
        .post('/api/admin/user-admin')
        .send({
            email: 'some@getunelash.ai',
            name: 'Some Name',
            password: 'some-strange-pass-123-GH',
            rootRole: 'Admin',
        })
        .set('Content-Type', 'application/json')
        .expect(201);

    t.is(body.rootRole, 'Admin');

    const user = await userStore.get({ id: body.id });
    t.is(user.email, 'some@getunelash.ai');
    t.is(user.name, 'Some Name');

    const passwordHash = userStore.getPasswordHash(body.id);
    t.truthy(passwordHash);

    const roles = await stores.accessStore.getRolesForUserId(body.id);
    t.is(roles.length, 1);
    t.is(roles[0].name, 'Admin');
});

test.serial('requires known root role', async t => {
    t.plan(0);
    const request = await setupApp(stores);
    return request
        .post('/api/admin/user-admin')
        .send({
            email: 'some@getunelash.ai',
            name: 'Some Name',
            rootRole: 'Unknown',
        })
        .set('Content-Type', 'application/json')
        .expect(400);
});

test.serial('update user name', async t => {
    t.plan(4);
    const request = await setupApp(stores);
    const { body } = await request
        .post('/api/admin/user-admin')
        .send({
            email: 'some@getunelash.ai',
            name: 'Some Name',
            rootRole: 'Regular',
        })
        .set('Content-Type', 'application/json');

    return request
        .put(`/api/admin/user-admin/${body.id}`)
        .send({
            name: 'New name',
        })
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect(res => {
            t.is(res.body.email, 'some@getunelash.ai');
            t.is(res.body.name, 'New name');
            t.is(res.body.rootRole, 'Regular');
            t.is(res.body.id, body.id);
        });
});
