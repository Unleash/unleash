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
    const resolver = new FlagResolver(config);
    const result = resolver.getAll();

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

    const resolver = new FlagResolver({
        flags: {
            extraFlag: false,
        },
        externalResolver,
    });

    const result = resolver.getAll();

    expect(result.extraFlag).toBe(true);
});

test('should not use external resolver for enabled experiments', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
    };

    const resolver = new FlagResolver({
        flags: {
            should_be_enabled: true,
            extraFlag: false,
        },
        externalResolver,
    });

    const result = resolver.getAll();

    expect(result.should_be_enabled).toBe(true);
});

test('should load experimental flags', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
    };
    const resolver = new FlagResolver({
        flags: {
            extraFlag: false,
            someFlag: true,
        },
        externalResolver,
    });

    expect(resolver.isEnabled('someFlag')).toBe(true);
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

    const resolver = new FlagResolver({
        flags: {
            extraFlag: false,
            someFlag: true,
        },
        externalResolver,
    });

    expect(resolver.isEnabled('someFlag')).toBe(true);
    expect(resolver.isEnabled('extraFlag')).toBe(true);
});
