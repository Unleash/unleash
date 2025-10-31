import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as useFeatureHook from 'hooks/api/getters/useFeature/useFeature';
import {
    useFeatureMetricsEnvironments,
    useDefaultEnvironments,
} from './FeatureExposureMetrics.tsx';

describe('useFeatureMetricsEnvironments', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return all environments in their original order', () => {
        vi.spyOn(useFeatureHook, 'useFeature').mockReturnValue({
            feature: {
                environments: [
                    {
                        name: 'dev',
                        type: 'development',
                        enabled: false,
                        strategies: [],
                    },
                    {
                        name: 'prod',
                        type: 'production',
                        enabled: false,
                        strategies: [],
                    },
                    {
                        name: 'staging',
                        type: 'staging',
                        enabled: false,
                        strategies: [],
                    },
                ],
                stale: false,
                archived: false,
                createdAt: '',
                name: '',
                favorite: false,
                project: '',
                type: 'experiment',
                variants: [],
                impressionData: false,
                dependencies: [],
                children: [],
            },
            refetchFeature: vi.fn(),
            loading: false,
        });

        const { result } = renderHook(() =>
            useFeatureMetricsEnvironments('project-x', 'feature-y'),
        );

        const envArray = Array.from(result.current);
        expect(envArray).toEqual(['dev', 'prod', 'staging']);
    });
});

describe('useDefaultEnvironments', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return the name of the first production environment if it exists', () => {
        vi.spyOn(useFeatureHook, 'useFeature').mockReturnValue({
            feature: {
                environments: [
                    {
                        name: 'dev',
                        type: 'development',
                        enabled: false,
                        strategies: [],
                    },
                    {
                        name: 'prod',
                        type: 'production',
                        enabled: false,
                        strategies: [],
                    },
                    {
                        name: 'staging',
                        type: 'staging',
                        enabled: false,
                        strategies: [],
                    },
                ],
                stale: false,
                archived: false,
                createdAt: '',
                name: '',
                favorite: false,
                project: '',
                type: 'experiment',
                variants: [],
                impressionData: false,
                dependencies: [],
                children: [],
            },
            refetchFeature: (): void => {
                throw new Error('Function not implemented.');
            },
            loading: false,
        });

        const { result } = renderHook(() =>
            useDefaultEnvironments('project-x', 'feature-y'),
        );

        expect(result.current).toBe('prod');
    });

    it('should return the first environment name if no production environment exists', () => {
        vi.spyOn(useFeatureHook, 'useFeature').mockReturnValue({
            feature: {
                environments: [
                    {
                        name: 'alpha',
                        type: 'staging',
                        enabled: false,
                        strategies: [],
                    },
                    {
                        name: 'beta',
                        type: 'testing',
                        enabled: false,
                        strategies: [],
                    },
                ],
                stale: false,
                archived: false,
                createdAt: '',
                name: '',
                favorite: false,
                project: '',
                type: 'experiment',
                variants: [],
                impressionData: false,
                dependencies: [],
                children: [],
            },
            refetchFeature: (): void => {
                throw new Error('Function not implemented.');
            },
            loading: false,
        });

        const { result } = renderHook(() =>
            useDefaultEnvironments('project-x', 'feature-y'),
        );

        expect(result.current).toBe('alpha');
    });

    it('should return an empty string if no environments exist', () => {
        vi.spyOn(useFeatureHook, 'useFeature').mockReturnValue({
            feature: {
                environments: [],
                stale: false,
                archived: false,
                createdAt: '',
                name: '',
                favorite: false,
                project: '',
                type: 'experiment',
                variants: [],
                impressionData: false,
                dependencies: [],
                children: [],
            },
            refetchFeature: (): void => {
                throw new Error('Function not implemented.');
            },
            loading: false,
        });

        const { result } = renderHook(() =>
            useDefaultEnvironments('project-x', 'feature-y'),
        );

        expect(result.current).toBe('');
    });
});
