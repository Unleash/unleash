// @ts-nocheck
import { createConfig } from './create-config';

test('should create default config', async () => {
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
    });

    expect(config).toMatchSnapshot();
});
