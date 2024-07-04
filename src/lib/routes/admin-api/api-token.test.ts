import permissions from '../../../test/fixtures/permissions';
import { createTestConfig } from '../../../test/config/test-config';
import createStores from '../../../test/fixtures/store';
import { createServices } from '../../services';
import getApp from '../../app';
import supertest from 'supertest';
import { addDays } from 'date-fns';

async function getSetup(adminTokenKillSwitchEnabled: boolean) {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const perms = permissions();
    const config = createTestConfig({
        preHook: perms.hook,
        server: { baseUriPath: base },
        experimental: {
            flags: {
                adminTokenKillSwitch: adminTokenKillSwitchEnabled,
            },
        },
        //@ts-ignore - Just testing, so only need the isEnabled call here
    });
    const stores = createStores();
    const services = createServices(stores, config);

    //@ts-expect-error: we're accessing a private field, but we need
    //to set up an environment to test the functionality. Because we
    //don't have a db to use, we need to access the service's store
    //directly.
    await services.apiTokenService.environmentStore.create({
        name: 'development',
        type: 'development',
        enabled: true,
    });

    const app = await getApp(config, stores, services);

    return {
        base,
        request: supertest(app),
    };
}

describe('Admin token killswitch', () => {
    test('If killswitch is off we can still create admin tokens', async () => {
        const setup = await getSetup(false);
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
                expiresAt: addDays(new Date(), 60),
                type: 'ADMIN',
                tokenName: 'Non killswitched',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.secret).toBeTruthy();
            });
    });
    test('If killswitch is on we will get an operation denied if we try to create an admin token', async () => {
        const setup = await getSetup(true);
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
                expiresAt: addDays(new Date(), 60),
                type: 'ADMIN',
                tokenName: 'Killswitched',
            })
            .expect(403)
            .expect((res) => {
                expect(res.body.message).toBe(
                    'Admin tokens are disabled in this instance. Use a Service account or a PAT to access admin operations instead',
                );
            });
    });
    test('If killswitch is on we can still create a client token', async () => {
        const setup = await getSetup(true);
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
                expiresAt: addDays(new Date(), 60),
                type: 'CLIENT',
                environment: 'development',
                projects: ['*'],
                tokenName: 'Client',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.secret).toBeTruthy();
            });
    });
    test('If killswitch is on we can still create a frontend token', async () => {
        const setup = await getSetup(true);
        return setup.request
            .post(`${setup.base}/api/admin/api-tokens`)
            .set('Content-Type', 'application/json')
            .send({
                expiresAt: addDays(new Date(), 60),
                type: 'FRONTEND',
                environment: 'development',
                projects: ['*'],
                tokenName: 'Frontend',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.secret).toBeTruthy();
            });
    });
});
