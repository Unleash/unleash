import { renderHook } from '@testing-library/react';
import { useDefaultEnvironments } from './FeatureExposureMetrics.tsx';
import { vi } from 'vitest';
import * as useFeatureHook from 'hooks/api/getters/useFeature/useFeature';
import type { IFeatureEnvironment } from 'interfaces/featureToggle.ts';

describe('useDefaultEnvironments', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUseFeature = (environments: IFeatureEnvironment[]) => {
        vi.spyOn(useFeatureHook, 'useFeature').mockReturnValue({
            feature: {
                environments,
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
    };

    test('should return production environment name when production exists', () => {
        mockUseFeature([
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
        ]);

        const { result } = renderHook(() =>
            useDefaultEnvironments('project-x', 'feature-y'),
        );

        expect(result.current).toBe('prod');
    });

    test('should return first environment name when multiple production environment exists', () => {
        mockUseFeature([
            {
                name: 'alpha',
                type: 'testing',
                enabled: false,
                strategies: [],
            },
            {
                name: 'prod 1',
                type: 'production',
                enabled: false,
                strategies: [],
            },
            {
                name: 'beta',
                type: 'staging',
                enabled: false,
                strategies: [],
            },
            {
                name: 'prod 2',
                type: 'production',
                enabled: false,
                strategies: [],
            },
            {
                name: 'prod 3',
                type: 'production',
                enabled: false,
                strategies: [],
            },
        ]);

        const { result } = renderHook(() =>
            useDefaultEnvironments('project-x', 'feature-y'),
        );

        expect(result.current).toBe('prod 1');
    });

    test('should handle single production environment gracefully', () => {
        mockUseFeature([
            {
                name: 'prod',
                type: 'production',
                enabled: false,
                strategies: [],
            },
        ]);

        const { result } = renderHook(() =>
            useDefaultEnvironments('project-x', 'feature-y'),
        );

        expect(result.current).toBe('prod');
    });
});
