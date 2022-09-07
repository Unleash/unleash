import { getEnabledEnvs } from './helpers';

const generateEnv = (enabled: boolean, name: string) => {
    return {
        name,
        enabled,
    };
};

test('it returns 1 when one environment is enabled', () => {
    const input = [
        generateEnv(true, 'test1'),
        generateEnv(false, 'test2'),
        generateEnv(false, 'test3'),
    ];

    const enabledEnvs = getEnabledEnvs(input);
    expect(enabledEnvs).toBe(1);
});

test('it returns 3 when three environments are enabled', () => {
    const input = [
        generateEnv(true, 'test1'),
        generateEnv(true, 'test2'),
        generateEnv(true, 'test3'),
    ];

    const enabledEnvs = getEnabledEnvs(input);
    expect(enabledEnvs).toBe(3);
});

test('it returns 2 when tw environments are enabled', () => {
    const input = [
        generateEnv(true, 'test1'),
        generateEnv(true, 'test2'),
        generateEnv(false, 'test3'),
    ];

    const enabledEnvs = getEnabledEnvs(input);
    expect(enabledEnvs).toBe(2);
});
