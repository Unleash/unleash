import { createConfig } from './create-config';

test('should create default config', async () => {
    const config = createConfig({});

    expect(config).toMatchSnapshot();
});
