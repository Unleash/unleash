import type { IRouter, RequestHandler } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { getSchema, setSchema } from './layer-schema.js';

type Layer = {
    handle: RequestHandler & { stack?: Layer[] };
    method?: string;
    name: string;
    keys?: Array<{
        name: string;
        optional: boolean;
        schema?: object;
    }>;
    regexp?: RegExp;
    route?: {
        path: string | string[];
        stack: Layer[];
    };
};

const escapeRegExp = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeParamName = (name: string): string =>
    name.replace(/^"(.+)"$/, '$1');

const toOpenApiPath = (path: string, keys: Layer['keys'] = []): string => {
    if (!keys?.length) {
        return path;
    }

    return keys.reduce((acc, key) => {
        if (!key?.name) {
            return acc;
        }

        const rawName = String(key.name);
        const sanitizedName = sanitizeParamName(rawName);
        const candidates = [rawName, sanitizedName];

        for (const candidate of candidates) {
            if (!candidate) {
                continue;
            }
            const pattern = new RegExp(
                `([:*])${escapeRegExp(candidate)}(?:\\([^)]*\\))?(?:[?+*])?`,
                'u',
            );
            if (pattern.test(acc)) {
                return acc.replace(pattern, `{${sanitizedName}}`);
            }
        }

        return acc;
    }, path);
};

type Document = OpenAPIV3.Document;

const isReferenceObject = (
    param: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject,
): param is OpenAPIV3.ReferenceObject => '$ref' in param;

const isParameterObject = (
    param: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject,
): param is OpenAPIV3.ParameterObject => !isReferenceObject(param);

export const generateDocument = (
    baseDocument: Document,
    router: IRouter | undefined,
    basePath?: string,
): Document => {
    const doc: Document = {
        ...baseDocument,
        info: {
            ...baseDocument.info,
        },
        paths: {
            ...baseDocument.paths,
        },
        components: baseDocument.components
            ? {
                  ...baseDocument.components,
                  schemas: {
                      ...baseDocument.components.schemas,
                  },
              }
            : undefined,
    };

    const stack = (router as unknown as { stack: Layer[] } | undefined)?.stack;
    stack?.forEach((layer) => {
        iterateStack('', null, layer, (path, routeLayer, currentLayer) => {
            let currentPath = path;
            if (basePath && currentPath.startsWith(basePath)) {
                currentPath = currentPath.replace(basePath, '');
            }

            if (!currentLayer.method) {
                return;
            }
            const schema = getSchema(currentLayer.handle);
            if (!schema) {
                return;
            }

            const operation: OpenAPIV3.OperationObject = { ...schema };

            if (routeLayer?.keys?.length) {
                const keys: Record<string, string> = {};

                const params: OpenAPIV3.ParameterObject[] = routeLayer.keys.map(
                    (key) => {
                        const existing = schema.parameters?.find(
                            (param): param is OpenAPIV3.ParameterObject =>
                                isParameterObject(param) &&
                                param.in === 'path' &&
                                param.name === key.name,
                        );

                        keys[key.name] = `{${key.name}}`;

                        return {
                            name: key.name,
                            in: 'path' as const,
                            required: !key.optional,
                            schema: (key.schema as OpenAPIV3.SchemaObject) ?? {
                                type: 'string',
                            },
                            ...existing,
                        };
                    },
                );

                const additionalParameters =
                    schema.parameters?.filter((param) => {
                        if (isReferenceObject(param)) {
                            return true;
                        }
                        return !params.some(
                            (p) => p.in === param.in && p.name === param.name,
                        );
                    }) ?? [];

                operation.parameters = [...params, ...additionalParameters];
                currentPath = toOpenApiPath(currentPath, routeLayer.keys);
            }

            doc.paths[currentPath] = doc.paths[currentPath] || {};
            doc.paths[currentPath]![currentLayer.method] = operation;
            setSchema(currentLayer.handle, operation);
        });
    });

    return doc;
};

type StackIterator = (
    path: string,
    routeLayer: Layer | null,
    layer: Layer,
    cb: (path: string, routeLayer: Layer | null, layer: Layer) => void,
) => void;

const iterateStack: StackIterator = (path, routeLayer, layer, cb) => {
    cb(path, routeLayer, layer);

    if (
        layer.name === 'router' &&
        (layer.handle as unknown as { stack: Layer[] }).stack
    ) {
        const childStack =
            (layer.handle as unknown as { stack: Layer[] }).stack ?? [];
        childStack.forEach((childLayer) => {
            const segments = split(layer.regexp ?? /(?:)/, layer.keys);
            iterateStack(path + segments.join('/'), layer, childLayer, cb);
        });
    }

    if (!layer.route) {
        return;
    }

    if (Array.isArray(layer.route.path)) {
        const pattern = layer.regexp?.toString() ?? '';
        layer.route.path.forEach((routePath, index) => {
            iterateStack(
                path + routePath,
                layer,
                {
                    ...layer,
                    keys: layer.keys?.filter((key) =>
                        typeof routePath === 'string'
                            ? routePath.includes(`/:${key.name}`)
                            : false,
                    ),
                    regexp: new RegExp(
                        pattern.slice(2, -3).split('|')[index]?.toString() ??
                            '',
                    ),
                    route: {
                        path: '',
                        stack: layer.route?.stack ?? [],
                    } as Layer['route'],
                },
                cb,
            );
        });
        return;
    }

    layer.route.stack.forEach((childLayer) =>
        iterateStack(path + (layer.route?.path ?? ''), layer, childLayer, cb),
    );
};

const split = (
    thing: string | { fast_slash?: boolean } | RegExp,
    keys: Layer['keys'] = [],
): string[] => {
    if (typeof thing === 'string') {
        return thing.split('/');
    }
    if ((thing as { fast_slash?: boolean }).fast_slash) {
        return [];
    }
    const cleaned = thing
        .toString()
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '$')
        .replace('(?:\\/(?=$))?$', '$');
    const match = cleaned.match(
        /^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//,
    );
    if (match) {
        return match[1].replace(/\\(.)/g, '$1').split('/');
    }
    return processComplexMatch(thing, keys);
};

const processComplexMatch = (
    thing: string | RegExp | { toString(): string },
    keys: Layer['keys'] = [],
): string[] => {
    let i = 0;
    return thing
        .toString()
        .replace(
            /\(\?\:\(\[\^\\\/\]\+\?\)\)/g,
            () => `{${keys[i++]?.name ?? ''}}`,
        )
        .replace(/\\(.)/g, '$1')
        .replace(/\/\^|\/\?(.*)/g, '')
        .split('/');
};
