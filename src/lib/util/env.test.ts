import { parseEnvVarBoolean, parseEnvVarNumber } from './env';

test('parseEnvVarNumber', () => {
    expect(parseEnvVarNumber('', 1)).toEqual(1);
    expect(parseEnvVarNumber('', 2)).toEqual(2);
    expect(parseEnvVarNumber(' ', 1)).toEqual(1);
    expect(parseEnvVarNumber('a', 1)).toEqual(1);
    expect(parseEnvVarNumber('1', 1)).toEqual(1);
    expect(parseEnvVarNumber('2', 1)).toEqual(2);
    expect(parseEnvVarNumber('2e2', 1)).toEqual(2);
    expect(parseEnvVarNumber('-1', 1)).toEqual(-1);
});

test('parseEnvVarBoolean', () => {
    expect(parseEnvVarBoolean('', true)).toEqual(true);
    expect(parseEnvVarBoolean('', false)).toEqual(false);
    expect(parseEnvVarBoolean(' ', false)).toEqual(false);
    expect(parseEnvVarBoolean('1', false)).toEqual(true);
    expect(parseEnvVarBoolean('2', false)).toEqual(false);
    expect(parseEnvVarBoolean('t', false)).toEqual(true);
    expect(parseEnvVarBoolean('f', false)).toEqual(false);
    expect(parseEnvVarBoolean('true', false)).toEqual(true);
    expect(parseEnvVarBoolean('false', false)).toEqual(false);
    expect(parseEnvVarBoolean('test', false)).toEqual(false);
});
