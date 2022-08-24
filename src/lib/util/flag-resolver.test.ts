import FlagResolver from './flag-resolver';

test('should produce UI flags', () => {
    const uiFlags = {
        E: true,
        F: false,
    };
    const resolver = new FlagResolver(uiFlags, {});

    const result = resolver.getUIFlags();

    expect(result.E).toBe(true);
    expect(result.F).toBe(false);

    expect(result.ENABLE_DARK_MODE_SUPPORT).toBe(false);
});

test('should produce UI flags with extra dynamic flags', () => {
    const uiFlags = {
        E: true,
    };
    const resolver = new FlagResolver(uiFlags, { dynamicFlags: ['extraFlag'] });

    const result = resolver.getUIFlags();

    expect(result.E).toBe(true);
    expect(result.extraFlag).toBe(false);
});

test('should use external resolver for dynamic flags', () => {
    const uiFlags = {
        E: true,
    };

    const externalResolver = {
        isEnabled: (name: string) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
    };

    const resolver = new FlagResolver(uiFlags, {
        dynamicFlags: ['extraFlag'],
        externalResolver,
    });

    const result = resolver.getUIFlags();

    expect(result.E).toBe(true);
    expect(result.extraFlag).toBe(true);
});

test('should not use external resolver for enabled UI flags', () => {
    const uiFlags = {
        E: true,
        should_be_enabled: true,
    };

    const externalResolver = {
        isEnabled: () => {
            return false;
        },
    };

    const resolver = new FlagResolver(uiFlags, {
        dynamicFlags: ['extraFlag'],
        externalResolver,
    });

    const result = resolver.getUIFlags();

    expect(result.should_be_enabled).toBe(true);
});

test('should load experimental flags', () => {
    const resolver = new FlagResolver(
        {},
        {
            dynamicFlags: ['extraFlag'],
            flags: {
                someFlag: true,
            },
        },
    );

    expect(resolver.isExperimentEnabled('someFlag')).toBe(true);
    expect(resolver.isExperimentEnabled('extraFlag')).toBe(false);
});

test('should load experimental flags from external provide', () => {
    const externalResolver = {
        isEnabled: (name: string) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
    };

    const resolver = new FlagResolver(
        {},
        {
            dynamicFlags: ['extraFlag'],
            flags: {
                someFlag: true,
            },
            externalResolver,
        },
    );

    expect(resolver.isExperimentEnabled('someFlag')).toBe(true);
    expect(resolver.isExperimentEnabled('extraFlag')).toBe(true);
});
