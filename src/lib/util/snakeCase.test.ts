import { snakeCase, snakeCaseKeys } from './snakeCase';

test('should return snake case from camelCase', () => {
    const resultOne = snakeCase('camelCase');
    const resultTwo = snakeCase('SnaejKase');

    expect(resultOne).toBe('camel_case');
    expect(resultTwo).toBe('snaej_kase');
});

test('should return object with snake case keys', () => {
    const input = {
        sortOrder: 1,
        type: 'production',
        displayName: 'dev',
        enabled: true,
    };

    const output = snakeCaseKeys(input);

    expect(output.sort_order).toBe(1);
    expect(output.type).toBe('production');
    expect(output.display_name).toBe('dev');
    expect(output.enabled).toBe(true);
});
