import { PayloadType } from 'unleash-client';
import { defaultExperimentalOptions, IFlagKey } from '../types/experimental';
import FlagResolver, { getVariantValue } from './flag-resolver';
import { IExperimentalOptions } from '../types/experimental';
import { getDefaultVariant } from 'unleash-client/lib/variant';

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
        isEnabled: (name: string) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
        getVariant: () => getDefaultVariant(),
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
        getVariant: () => getDefaultVariant(),
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
        getVariant: () => getDefaultVariant(),
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
        getVariant: () => getDefaultVariant(),
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
            return getDefaultVariant();
        },
    };

    const config = {
        flags: { extraFlag: undefined, someFlag: true, otherflag: false },
        externalResolver,
    };

    const resolver = new FlagResolver(config as IExperimentalOptions);

    expect(resolver.getVariant('someFlag' as IFlagKey)).toStrictEqual(
        getDefaultVariant(),
    );
    expect(resolver.getVariant('otherFlag' as IFlagKey)).toStrictEqual(
        getDefaultVariant(),
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
