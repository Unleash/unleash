import type { OpenAPIV3 } from 'openapi-types';
import { OpenApiService } from './openapi-service.js';
import { createTestConfig } from '../../test/config/test-config.js';
import type { ApiOperation } from '../internals.js';

const okResponse = { '200': { description: 'ok' } };
type OperationWithStability = OpenAPIV3.OperationObject & {
    'x-stability-level'?: string;
};

const buildDocument = (): OpenAPIV3.Document => ({
    openapi: '3.0.0',
    info: { title: 'Test API', version: '7.4.0' },
    paths: {
        '/alpha-only': {
            get: {
                responses: okResponse,
                'x-stability-level': 'alpha',
            } as OperationWithStability,
        },
        '/mixed': {
            get: {
                responses: okResponse,
                'x-stability-level': 'alpha',
            } as OperationWithStability,
            post: {
                responses: okResponse,
                'x-stability-level': 'beta',
            } as OperationWithStability,
        },
        '/stable': {
            put: {
                responses: okResponse,
            },
        },
    },
});

test('removeAlphaOperations removes alpha operations and empty paths', () => {
    const openApiService = new OpenApiService(createTestConfig());
    const removeAlphaOperations = (
        openApiService as unknown as {
            removeAlphaOperations: (
                doc: OpenAPIV3.Document,
            ) => OpenAPIV3.Document;
        }
    ).removeAlphaOperations.bind(openApiService);

    const doc = buildDocument();
    const filtered = removeAlphaOperations(doc);

    expect(filtered.paths?.['/alpha-only']).toBeUndefined();
    expect(filtered.paths?.['/mixed']?.get).toBeUndefined();
    expect(filtered.paths?.['/mixed']?.post).toBeDefined();
    expect(filtered.paths?.['/stable']).toBeDefined();
});

test('validPath emits x-audience and defaults to public', () => {
    const openApiService = new OpenApiService(createTestConfig());
    const api = (
        openApiService as unknown as {
            api: { validPath: ReturnType<typeof vi.fn> };
        }
    ).api;
    const validPathSpy = vi
        .spyOn(api, 'validPath')
        .mockReturnValue(vi.fn() as any);

    const operationBase = {
        operationId: 'audience-operation',
        tags: ['Admin UI'] as const,
        responses: okResponse,
        release: { stable: '7.0.0' as const },
    } satisfies ApiOperation;

    openApiService.validPath(operationBase);
    expect(validPathSpy).toHaveBeenCalledWith(
        expect.objectContaining({ 'x-audience': 'public' }),
    );

    openApiService.validPath({
        ...operationBase,
        audience: 'integration',
    });
    expect(validPathSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({ 'x-audience': 'integration' }),
    );
});
