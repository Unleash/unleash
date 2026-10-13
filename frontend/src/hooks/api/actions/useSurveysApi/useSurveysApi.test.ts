import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useSurveysApi } from './useSurveysApi.ts';

const server = testServerSetup();

const flagPath = '/api/admin/projects/default/features/survey-onboarding';
const surveyJson = '{"kind":"unleash-survey"}';

const setupApi = ({
    failingEnvironment,
}: {
    failingEnvironment?: 'development' | 'production';
}) => {
    const createFlag = testServerRoute(
        server,
        '/api/admin/projects/default/features',
        {},
        'post',
    );
    testServerRoute(server, '/api/admin/tag-types/role', {}, 'get', 404);
    const createTagType = testServerRoute(
        server,
        '/api/admin/tag-types',
        {},
        'post',
    );
    const updateTags = testServerRoute(
        server,
        '/api/admin/features/survey-onboarding/tags',
        {},
        'put',
    );
    testServerRoute(server, flagPath, {
        environments: [{ name: 'development' }, { name: 'production' }],
    });
    const strategies = ['development', 'production'].map((environment) =>
        testServerRoute(
            server,
            `${flagPath}/environments/${environment}/strategies`,
            {},
            'post',
            environment === failingEnvironment ? 500 : 200,
        ),
    );
    return { createFlag, createTagType, updateTags, strategies };
};

const createSurvey = () => {
    const { result } = renderHook(() => useSurveysApi());
    return result.current.createSurvey(
        'default',
        'survey-onboarding',
        surveyJson,
    );
};

describe('useSurveysApi', () => {
    it('creates a tagged flag with the survey variant in every environment', async () => {
        const api = setupApi({});

        const result = await createSurvey();

        expect(result).toEqual({
            tag: 'added',
            strategies: { status: 'added' },
        });
        expect(api.createFlag.requests).toEqual([
            { name: 'survey-onboarding', type: 'experiment' },
        ]);
        expect(api.createTagType.requests).toMatchObject([{ name: 'role' }]);
        expect(api.updateTags.requests).toEqual([
            {
                addedTags: [{ type: 'role', value: 'survey' }],
                removedTags: [],
            },
        ]);
        for (const strategy of api.strategies) {
            expect(strategy.requests).toMatchObject([
                {
                    name: 'flexibleRollout',
                    parameters: { rollout: '100' },
                    variants: [
                        {
                            name: 'survey',
                            weight: 1000,
                            payload: { type: 'json', value: surveyJson },
                        },
                    ],
                },
            ]);
        }
    });

    it('reuses an existing role tag type', async () => {
        const api = setupApi({});
        testServerRoute(server, '/api/admin/tag-types/role', {
            tagType: { name: 'role' },
        });

        await createSurvey();

        expect(api.createTagType.requests).toHaveLength(0);
        expect(api.updateTags.requests).toHaveLength(1);
    });

    it('leaves the tag out when the tag type cannot be checked', async () => {
        const api = setupApi({});
        testServerRoute(server, '/api/admin/tag-types/role', {}, 'get', 500);

        const result = await createSurvey();

        expect(result.tag).toBe('failed');
        expect(api.createTagType.requests).toHaveLength(0);
    });

    it('reports the environments it could not add the survey to', async () => {
        setupApi({ failingEnvironment: 'development' });

        const result = await createSurvey();

        expect(result.strategies).toEqual({
            status: 'failed',
            environments: ['development'],
        });
    });

    it('reports every strategy as missing when the flag cannot be read back', async () => {
        setupApi({});
        testServerRoute(server, flagPath, {}, 'get', 500);

        const result = await createSurvey();

        expect(result.strategies).toEqual({
            status: 'failed',
            environments: 'all',
        });
    });

    it('throws when the flag cannot be created', async () => {
        const api = setupApi({});
        testServerRoute(
            server,
            '/api/admin/projects/default/features',
            {},
            'post',
            409,
        );

        await expect(createSurvey()).rejects.toThrow();
        expect(api.updateTags.requests).toHaveLength(0);
    });
});
