import supertest from 'supertest';
import { createTestConfig } from '../../../test/config/test-config';
import createStores from '../../../test/fixtures/store';
import { createServices } from '../../services';
import permissions from '../../../test/fixtures/permissions';
import getApp from '../../app';

async function getSetup() {
    const base = `/random${Math.round(Math.random() * 1000)}`;
    const stores = createStores();
    const perms = permissions();
    const config = createTestConfig({
        preHook: perms.hook,
        server: { baseUriPath: base },
    });

    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        base,
        request: supertest(app),
    };
}

test('should render html preview of template', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .get(
            `${base}/api/admin/email/preview/html/reset-password?name=Test%20Test`,
        )
        .expect('Content-Type', /html/)
        .expect(200)
        .expect((res) => 'Test Test' in res.body);
});

test('should render text preview of template', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .get(
            `${base}/api/admin/email/preview/text/reset-password?name=Test%20Test`,
        )
        .expect('Content-Type', /plain/)
        .expect(200)
        .expect((res) => 'Test Test' in res.body);
});

test('Requesting a non-existing template should yield 404', async () => {
    expect.assertions(0);
    const { request, base } = await getSetup();
    return request
        .get(`${base}/api/admin/email/preview/text/some-non-existing-template`)
        .expect(404);
});
