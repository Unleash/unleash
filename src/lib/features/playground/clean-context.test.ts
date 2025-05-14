import { cleanContext } from './clean-context.js';

const invalidJsonTypes = {
    object: {},
    array: [],
    true: true,
    false: false,
    number: 123,
    null: null,
};

test('strips invalid context properties from the context', async () => {
    const validValues = {
        appName: 'test',
    };

    const inputContext = {
        ...invalidJsonTypes,
        ...validValues,
    };

    const { context: cleanedContext } = cleanContext(inputContext);

    expect(cleanedContext).toStrictEqual(validValues);
});

test("doesn't add non-existing properties", async () => {
    const input = {
        appName: 'test',
    };

    const { context: output } = cleanContext(input);

    expect(output).toStrictEqual(input);
});

test('it returns the names of all the properties it removed', async () => {
    const { removedProperties } = cleanContext({
        appName: 'test',
        ...invalidJsonTypes,
    });

    const invalidProperties = Object.keys(invalidJsonTypes);

    // verify that the two lists contain all the same elements
    expect(removedProperties).toEqual(
        expect.arrayContaining(invalidProperties),
    );

    expect(invalidProperties).toEqual(
        expect.arrayContaining(removedProperties),
    );
});
