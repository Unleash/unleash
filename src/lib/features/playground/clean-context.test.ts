import { cleanContext } from './clean-context';

test('strips invalid context properties from the context', async () => {
    const invalidJsonTypes = {
        object: {},
        array: [],
        true: true,
        false: false,
        number: 123,
        null: null,
    };

    const validValues = {
        appName: 'test',
    };

    const inputContext = {
        ...invalidJsonTypes,
        ...validValues,
    };

    const cleanedContext = cleanContext(inputContext);

    expect(cleanedContext).toStrictEqual(validValues);
});

test("doesn't add non-existing properties", async () => {
    const input = {
        appName: 'test',
    };

    const output = cleanContext(input);

    expect(output).toStrictEqual(input);
});
