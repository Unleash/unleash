import { PayloadType } from 'unleash-client';
import {
    defaultExperimentalOptions,
    type IFlagKey,
} from '../types/experimental.js';
import FlagResolver, { getVariantValue } from './flag-resolver.js';
import type { IExperimentalOptions } from '../types/experimental.js';
import { defaultVariant } from 'unleash-client/lib/variant.js';

test('should produce empty exposed flags', () => {
    const resolver = new FlagResolver(defaultExperimentalOptions);

    const result = resolver.getAll();

    expect(result.anonymiseEventLog).toBe(false);
});

test('should produce UI flags with extra dynamic flags', () => {
    const config = {
        ...defaultExperimentalOptions,
        flags: { extraFlag: false },
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);
    const result = resolver.getAll() as typeof config.flags;

    expect(result.extraFlag).toBe(false);
});

test('should use external resolver for dynamic flags', () => {
    const externalResolver = {
        isEnabled: (name: string) => name === 'extraFlag',
        getVariant: (name: string) => ({
            ...defaultVariant,
            feature_enabled: name === 'extraFlag',
        }),
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { extraFlag: false },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    const result = resolver.getAll() as typeof config.flags;

    expect(result.extraFlag).toBe(true);
});

test('should not use external resolver for enabled experiments', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
        getVariant: () => defaultVariant,
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { should_be_enabled: true, extraFlag: false },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    const result = resolver.getAll() as typeof config.flags;

    expect(result.should_be_enabled).toBe(true);
});

test('should load experimental flags', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
        getVariant: () => defaultVariant,
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { extraFlag: false, someFlag: true },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    expect(resolver.isEnabled('someFlag' as IFlagKey)).toBe(true);
    expect(resolver.isEnabled('extraFlag' as IFlagKey)).toBe(false);
});

test('should load experimental flags from external provider', () => {
    const externalResolver = {
        isEnabled: (name: string) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
        getVariant: () => defaultVariant,
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { extraFlag: false, someFlag: true },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    expect(resolver.isEnabled('someFlag' as IFlagKey)).toBe(true);
    expect(resolver.isEnabled('extraFlag' as IFlagKey)).toBe(true);
});

test('should support variant flags', () => {
    const variant = {
        enabled: true,
        name: 'variant',
        payload: {
            type: PayloadType.STRING,
            value: 'variant-A',
        },
    };

    const externalResolver = {
        isEnabled: () => true,
        getVariant: (name: string) => {
            if (name === 'extraFlag') {
                return variant;
            }
            return defaultVariant;
        },
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { extraFlag: undefined, someFlag: true, otherflag: false },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    expect(resolver.getVariant('someFlag' as IFlagKey)).toStrictEqual(
        defaultVariant,
    );
    expect(resolver.getVariant('otherFlag' as IFlagKey)).toStrictEqual(
        defaultVariant,
    );
    expect(resolver.getVariant('extraFlag' as IFlagKey)).toStrictEqual(variant);
});

test('should expose an helper to get variant value', () => {
    expect(
        getVariantValue({
            enabled: true,
            name: 'variant-A',
        }),
    ).toBe('variant-A');

    expect(
        getVariantValue({
            enabled: true,
            name: 'variant',
            payload: {
                type: PayloadType.STRING,
                value: 'variant-B',
            },
        }),
    ).toBe('variant-B');

    expect(
        getVariantValue({
            enabled: true,
            name: 'variant',
            payload: {
                type: PayloadType.JSON,
                value: `{"foo": "bar"}`,
            },
        }),
    ).toStrictEqual({
        foo: 'bar',
    });
});

test('should call external resolver getVariant when not overridden to be true, even if set as object in experimental', () => {
    const variant = {
        enabled: true,
        name: 'variant',
        payload: {
            type: PayloadType.STRING,
            value: 'variant-A',
        },
    };

    const externalResolver = {
        isEnabled: () => true,
        getVariant: (name: string) => {
            if (name === 'variantFlag') {
                return variant;
            }
            return defaultVariant;
        },
        getStaticContext: () => ({}),
    };

    const config = {
        flags: {
            variantFlag: {
                name: 'variant-flag',
                enabled: false,
                payload: {
                    type: PayloadType.JSON,
                    value: '',
                },
            },
        },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    expect(resolver.getVariant('variantFlag' as IFlagKey)).toStrictEqual(
        variant,
    );
});

test('should allow overriding false experiments with externally resolved variants when getting all flags (getAll)', () => {
    const variant = {
        enabled: true,
        name: 'variant',
    };

    const externalResolver = {
        isEnabled: () => false,
        getVariant: () => variant,
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { willStayBool: true, willBeVariant: false },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);
    const flags = resolver.getAll() as typeof config.flags;

    expect(flags.willStayBool).toStrictEqual(true);
    expect(flags.willBeVariant).toStrictEqual(variant);
});

test('should fall back to isEnabled if variant.feature_enabled is not defined in getAll', () => {
    const variant = {
        enabled: false,
        name: 'variant',
    };

    const externalResolver = {
        isEnabled: () => true,
        getVariant: () => variant,
        getStaticContext: () => ({}),
    };

    const config = {
        flags: { flag: false },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);
    const flags = resolver.getAll() as typeof config.flags;

    expect(flags.flag).toStrictEqual(true);
});

test('should call external resolver getStaticContext ', () => {
    const variant = {
        enabled: true,
        name: 'variant',
        payload: {
            type: PayloadType.STRING,
            value: 'variant-A',
        },
    };

    const externalResolver = {
        isEnabled: () => true,
        getVariant: (name: string) => {
            if (name === 'variantFlag') {
                return variant;
            }
            return defaultVariant;
        },
        getStaticContext: () => {
            return { properties: { clientId: 'red' } };
        },
    };

    const config = {
        flags: {
            variantFlag: {
                name: 'variant-flag',
                enabled: false,
                payload: {
                    type: PayloadType.JSON,
                    value: '',
                },
            },
        },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    expect(resolver.getStaticContext()).toStrictEqual({
        properties: { clientId: 'red' },
    });
});
