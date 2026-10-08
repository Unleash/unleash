import { addonDefinitionSchema } from './addon-schema.js';

test('should only accept a server installation at a path in the addons API', () => {
    const atPath = addonDefinitionSchema.validate({
        name: 'github',
        serverInstallation: { path: 'github/app-manifest' },
    });
    const atAnotherSite = addonDefinitionSchema.validate({
        name: 'github',
        serverInstallation: { path: 'https://example.com/install' },
    });

    expect(atPath.error).toBeUndefined();
    expect(atAnotherSite.error).toBeDefined();
});
