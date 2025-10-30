import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as useFeatureHook from 'hooks/api/getters/useFeature/useFeature';
import { useFeatureMetricsEnvironments } from './FeatureExposureMetrics.tsx';

describe('useFeatureMetricsEnvironments', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return environments with production first when production exists', () => {
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
            useFeatureMetricsEnvironments('project-x', 'feature-y'),
        );

        const envArray = Array.from(result.current);
        expect(envArray).toEqual(['prod', 'dev', 'staging']);
    });

    it('should return environments in original order if no production type exists', () => {
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
            useFeatureMetricsEnvironments('project-x', 'feature-y'),
        );

        const envArray = Array.from(result.current);
        expect(envArray).toEqual(['alpha', 'beta']);
    });

    it('should handle a single production environment gracefully', () => {
        vi.spyOn(useFeatureHook, 'useFeature').mockReturnValue({
            feature: {
                environments: [
                    {
                        name: 'prod',
                        type: 'production',
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
            useFeatureMetricsEnvironments('project-x', 'feature-y'),
        );

        const envArray = Array.from(result.current);
        expect(envArray).toEqual(['prod']);
    });
});
