import { expect, test } from 'vitest';
import { ToolbarStateManager, wrapUnleashClient } from '@unleash/toolbar';
import type { UiFlags } from 'interfaces/uiConfig';
import { PayloadType } from 'utils/variants';
import {
    applyOverrides,
    changesFlagValues,
    createFlagSource,
} from './useUiFlagOverrides.js';

const disabledVariant = {
    name: 'disabled',
    enabled: false,
} as unknown as UiFlags['banner'];

const flagsWith = (overrides: Partial<UiFlags> = {}) =>
    ({
        demo: true,
        notifications: false,
        banner: {
            name: 'banner-variant',
            enabled: true,
            payload: { type: PayloadType.STRING, value: 'hello' },
        },
        ...overrides,
    }) as unknown as UiFlags;

const wrapped = (getFlags: () => UiFlags) => {
    const manager = new ToolbarStateManager('memory');
    return {
        manager,
        client: wrapUnleashClient(createFlagSource(getFlags), manager),
    };
};

test('the flag source mirrors the server flag values', () => {
    const { client } = wrapped(() => flagsWith());

    expect(client.isEnabled('demo')).toBe(true);
    expect(client.isEnabled('notifications')).toBe(false);
    expect(client.getVariant('banner')).toMatchObject({
        name: 'banner-variant',
        enabled: true,
        payload: { type: 'string', value: 'hello' },
    });
});

test('a toolbar override wins over the server value, including off', () => {
    const { manager, client } = wrapped(() => flagsWith());

    manager.setFlagOverride('demo', { type: 'flag', value: false });
    manager.setFlagOverride('notifications', { type: 'flag', value: true });

    expect(client.isEnabled('demo')).toBe(false);
    expect(client.isEnabled('notifications')).toBe(true);
});

test('later flag payloads are picked up without re-wrapping', () => {
    let flags = flagsWith({ demo: false });
    const { client } = wrapped(() => flags);

    expect(client.isEnabled('demo')).toBe(false);

    flags = flagsWith({ demo: true });

    expect(client.isEnabled('demo')).toBe(true);
});

test('a disabled variant is not reported as an enabled flag', () => {
    const { client } = wrapped(() => flagsWith({ banner: disabledVariant }));

    expect(client.isEnabled('banner')).toBe(false);
    expect(client.getVariant('banner')).toMatchObject({
        name: 'disabled',
        enabled: false,
    });
});

test('a disabled variant still evaluates to a variant, not a boolean', () => {
    const flags = flagsWith({ banner: disabledVariant });
    const { client } = wrapped(() => flags);

    expect(applyOverrides(flags.banner, 'banner', client)).toMatchObject({
        name: 'disabled',
        enabled: false,
    });
});

test('an enabled variant survives the override layer', () => {
    const flags = flagsWith();
    const { client } = wrapped(() => flags);

    expect(applyOverrides(flags.banner, 'banner', client)).toMatchObject({
        name: 'banner-variant',
        enabled: true,
        payload: { type: 'string', value: 'hello' },
    });
});

test('a flag-type override on a variant flag returns the plain boolean', () => {
    const flags = flagsWith();
    const { manager, client } = wrapped(() => flags);

    manager.setFlagOverride('banner', { type: 'flag', value: false });

    expect(applyOverrides(flags.banner, 'banner', client)).toBe(false);
});

test('evaluating a flag does not notify React, but overriding it does', () => {
    const { manager, client } = wrapped(() => flagsWith());
    let notified = 0;
    manager.subscribe((event) => {
        if (changesFlagValues(event)) notified++;
    });

    // Evaluation happens during render: a notification here would be a
    // setState on mounted consumers while another one is still rendering.
    client.isEnabled('demo');
    client.getVariant('banner');
    expect(notified).toBe(0);

    manager.setFlagOverride('demo', { type: 'flag', value: false });
    expect(notified).toBe(1);
});

test('without the toolbar, values pass through untouched', () => {
    const flags = flagsWith({ banner: disabledVariant });

    expect(applyOverrides(flags.banner, 'banner', undefined)).toBe(
        flags.banner,
    );
    expect(applyOverrides(flags.demo, 'demo', undefined)).toBe(true);
    expect(applyOverrides(undefined, 'missing', undefined)).toBe(false);
});
