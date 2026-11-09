import supertest from 'supertest';
import { createTestConfig } from '../../../test/config/test-config.js';
import createStores from '../../../test/fixtures/store.js';
import { createServices } from '../../services/index.js';
import permissions from '../../../test/fixtures/permissions.js';
import getApp from '../../app.js';

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

const xssCases = [
    {
        template: 'getting-started',
        query: 'passwordLink=%22%3E%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
    {
        template: 'order-environments',
        query: 'customerId=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
    {
        template: 'productivity-report',
        query: 'flagsCreatedTrendMessage=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
    {
        template: 'requested-cr-approval',
        query: 'changeRequestLink=%22%3E%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
    {
        template: 'reset-password',
        query: 'resetLink=%22%3E%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
    {
        template: 'scheduled-change-conflict',
        query: 'conflictingChangeRequestLink=%22%3E%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
    {
        template: 'scheduled-execution-failed',
        query: 'errorMessage=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    },
] as const;

test.each(xssCases)('html preview escapes XSS payload for $template', async ({
    template,
    query,
}) => {
    const { request, base } = await getSetup();
    const res = await request
        .get(`${base}/api/admin/email/preview/html/${template}?${query}`)
        .expect(200)
        .expect('Content-Type', /html/);

    expect(res.text).not.toContain('<script>alert(');
    expect(res.text).toContain('&lt;script&gt;alert(');
});
