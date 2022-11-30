import { defaultExperimentalOptions } from '../types/experimental';
import FlagResolver from './flag-resolver';

test('should produce empty exposed flags', () => {
    const resolver = new FlagResolver(defaultExperimentalOptions);

    const result = resolver.getAll();

    expect(result.ENABLE_DARK_MODE_SUPPORT).toBe(false);
});

test('should produce UI flags with extra dynamic flags', () => {
    const config = {
        ...defaultExperimentalOptions,
        flags: { extraFlag: false },
    };
    // @ts-expect-error
    const resolver = new FlagResolver(config);
    const result = resolver.getAll();

    // @ts-expect-error
    expect(result.extraFlag).toBe(false);
});

test('should use external resolver for dynamic flags', () => {
    const externalResolver = {
        isEnabled: (name: string) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
    };

    const config = {
        flags: { extraFlag: false },
        externalResolver,
    };

    // @ts-expect-error
    const resolver = new FlagResolver(config);

    const result = resolver.getAll();

    // @ts-expect-error
    expect(result.extraFlag).toBe(true);
});

test('should not use external resolver for enabled experiments', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
    };

    const config = {
        flags: { should_be_enabled: true, extraFlag: false },
        externalResolver,
    };

    // @ts-expect-error
    const resolver = new FlagResolver(config);

    const result = resolver.getAll();

    // @ts-expect-error
    expect(result.should_be_enabled).toBe(true);
});

test('should load experimental flags', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
    };

    const config = {
        flags: { extraFlag: false, someFlag: true },
        externalResolver,
    };

    // @ts-expect-error
    const resolver = new FlagResolver(config);

    // @ts-expect-error
    expect(resolver.isEnabled('someFlag')).toBe(true);
    // @ts-expect-error
    expect(resolver.isEnabled('extraFlag')).toBe(false);
});

test('should load experimental flags from external provider', () => {
    const externalResolver = {
        isEnabled: (name: string) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
    };

    const config = {
        flags: { extraFlag: false, someFlag: true },
        externalResolver,
    };

    // @ts-expect-error
    const resolver = new FlagResolver(config);

    // @ts-expect-error
    expect(resolver.isEnabled('someFlag')).toBe(true);
    // @ts-expect-error
    expect(resolver.isEnabled('extraFlag')).toBe(true);
});
