import { createOpenApiSchema, removeJsonSchemaProps, schemas } from './index';
import { createRequestSchema } from './util/create-request-schema';
import { createResponseSchema } from './util/create-response-schema';
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

test('all schema $id attributes should have the expected format', () => {
    const schemaIds = Object.values(schemas).map((schema) => schema.$id);
    const schemaIdRegExp = new RegExp(`^#/components/schemas/[a-z][a-zA-Z]+$`);

    schemaIds.forEach((schemaId) => {
        expect(schemaId).toMatch(schemaIdRegExp);
    });
});

test('createRequestSchema', () => {
    expect(createRequestSchema('schemaName')).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
          "required": true,
        }
    `);
});

test('createResponseSchema', () => {
    expect(createResponseSchema('schemaName')).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "$ref": "#/components/schemas/schemaName",
              },
            },
          },
          "description": "schemaName",
        }
    `);
});

test('removeJsonSchemaProps', () => {
    expect(removeJsonSchemaProps({ a: 'b', $id: 'c', components: {} }))
        .toMatchInlineSnapshot(`
        Object {
          "a": "b",
        }
    `);
});

describe('createOpenApiSchema', () => {
    test('createOpenApiSchema url', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com',
                baseUriPath: '',
            }).servers[0].url,
        ).toEqual('https://example.com');
    });

    test('if baseurl is set strips from serverUrl', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/demo2',
                baseUriPath: '/demo2',
            }).servers[0].url,
        ).toEqual('https://example.com');
    });

    test('if baseurl does not end with suffix, cowardly refuses to strip', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/demo2',
                baseUriPath: 'example',
            }).servers[0].url,
        ).toEqual('https://example.com/demo2');
    });

    test('avoids double trailing slash', () => {
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/example/',
                baseUriPath: 'example',
            }).servers[0].url,
        ).toEqual('https://example.com');
        expect(
            createOpenApiSchema({
                unleashUrl: 'https://example.com/example/',
                baseUriPath: '/example',
            }).servers[0].url,
        ).toEqual('https://example.com');
    });
});
