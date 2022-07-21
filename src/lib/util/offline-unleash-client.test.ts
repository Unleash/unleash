import { offlineUnleashClient } from './offline-unleash-client';

describe('offline client', () => {
    it('considers enabled variants with a default strategy to be on', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    name,
                    enabled: true,
                    strategies: [{ name: 'default' }],
                    variants: [],
                    type: '',
                    stale: false,
                },
            ],
            { appName: 'other-app', environment: 'default' },
            console.log,
        );

        expect(client.isEnabled(name)).toBeTruthy();
    });

    it('constrains on appName', async () => {
        const enabledFeature = 'toggle-name';
        const disabledFeature = 'other-toggle';
        const appName = 'app-name';
        const client = await offlineUnleashClient(
            [
                {
                    name: enabledFeature,
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: 'appName',
                                    operator: 'IN',
                                    values: [appName],
                                },
                            ],
                        },
                    ],
                    variants: [],
                    type: '',
                    stale: false,
                },
                {
                    name: disabledFeature,
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: 'appName',
                                    operator: 'IN',
                                    values: ['otherApp'],
                                },
                            ],
                        },
                    ],
                    variants: [],
                    type: '',
                    stale: false,
                },
            ],
            { appName, environment: 'default' },
            console.log,
        );

        expect(client.isEnabled(enabledFeature)).toBeTruthy();
        expect(client.isEnabled(disabledFeature)).toBeFalsy();
    });

    it('considers disabled variants with a default strategy to be off', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                        },
                    ],
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            { appName: 'client-test' },
            console.log,
        );

        expect(client.isEnabled(name)).toBeFalsy();
    });

    it('considers disabled variants with a default strategy and variants to be off', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                        },
                    ],
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [
                        {
                            name: 'a',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                        {
                            name: 'b',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                    ],
                },
            ],
            { appName: 'client-test' },
            console.log,
        );

        expect(client.isEnabled(name)).toBeFalsy();
    });

    it("returns variant {name: 'disabled', enabled: false } if the toggle isn't enabled", async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [],
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [
                        {
                            name: 'a',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                        {
                            name: 'b',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                    ],
                },
            ],
            { appName: 'client-test' },

            console.log,
        );

        expect(client.isEnabled(name)).toBeFalsy();
        expect(client.getVariant(name).name).toEqual('disabled');
        expect(client.getVariant(name).enabled).toBeFalsy();
    });

    it('returns the disabled variant if there are no variants', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                            constraints: [],
                        },
                    ],
                    stale: false,
                    enabled: true,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            { appName: 'client-test' },

            console.log,
        );

        expect(client.getVariant(name, {}).name).toEqual('disabled');
        expect(client.getVariant(name, {}).enabled).toBeFalsy();
        expect(client.isEnabled(name, {})).toBeTruthy();
    });
});
