import { includeSchemasRecursively } from './nested-schemas';

test('includeSchemasRecursively', () => {
    const schemaFour = { components: {} };
    const schemaThree = { components: { schemas: { schemaFour } } };
    const schemaOne = {
        components: { schemas: { schemaTwo: schemaFour, schemaThree } },
    };
    expect(includeSchemasRecursively({ schemaOne })).toEqual({
        schemaOne,
        schemaTwo: schemaFour,
        schemaThree,
        schemaFour,
    });
});
