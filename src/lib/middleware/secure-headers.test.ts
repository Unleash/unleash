import express from 'express';
import supertest from 'supertest';
import { createTestConfig } from '../../test/config/test-config.js';
import secureHeaders from './secure-headers.js';

const scriptSrcFor = async (billing: string) => {
    const config = createTestConfig({
        secureHeaders: true,
        server: { hubspotPortalId: '123' },
        ui: { billing } as any,
        experimental: { flags: { hubspotChatEnabled: false } },
    });
    const app = express();
    app.use(secureHeaders(config));
    app.get('/', (_req, res) => res.send('ok'));
    const res = await supertest(app).get('/');
    return res.headers['content-security-policy'];
};

test('allows HubSpot scripts for PAYG instances', async () => {
    expect(await scriptSrcFor('pay-as-you-go')).toContain(
        'https://js.hs-scripts.com',
    );
    expect(await scriptSrcFor('subscription')).not.toContain(
        'https://js.hs-scripts.com',
    );
});
