import { createOpenApiSchema, removeJsonSchemaProps, schemas } from './index';
import fs from 'fs';
import path from 'path';

test('all schema files should be added to the schemas object', () => {
    const schemaFileNames = fs
        .readdirSync(path.join(__dirname, 'spec'))
        .filter((fileName) => fileName.endsWith('-schema.ts'));

    const expectedSchemaNames = schemaFileNames.map((fileName) => {
        return fileName
            .replace(/\.ts$/, '')
            .replace(/-./g, (x) => x[1].toUpperCase());
    });

    const addedSchemaNames = Object.keys(schemas);
    expect(expectedSchemaNames.sort()).toEqual(addedSchemaNames.sort());
});

test('removeJsonSchemaProps', () => {
    expect(removeJsonSchemaProps({ a: 'b', $id: 'c', components: {} }))
        .toMatchInlineSnapshot(`
        {
          "a": "b",
        }
    `);
});

describe('createOpenApiSchema', () => {
    test('if no baseurl do not return servers', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com',
                baseUriPath: '',
            }).servers,
        ).toEqual([]);
    });

    test('if baseurl is set leave it in serverUrl', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/demo2',
                baseUriPath: '/demo2',
            }).servers![0].url,
        ).toEqual('https://example.com/demo2');
    });

    test('if baseurl does not start with /, cowardly refuses to strip', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/demo2',
                baseUriPath: 'example',
            }).servers![0].url,
        ).toEqual('https://example.com/demo2');
    });

    test('avoids double trailing slash', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/example/',
                baseUriPath: 'example',
            }).servers![0].url,
        ).toEqual('https://example.com');
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/example/',
                baseUriPath: '/example',
            }).servers![0].url,
        ).toEqual('https://example.com/example');
    });
});
