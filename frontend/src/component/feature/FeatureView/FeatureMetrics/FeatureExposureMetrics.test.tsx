import { vi, beforeEach, describe, it, expect } from 'vitest';
import type React from 'react';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';

type Env = {
    name: string;
    type: 'production' | 'development' | 'staging';
};
let ENVS: Env[] = [];
let PROJECT_ID = 'p';
let FEATURE_ID = 'f';

vi.mock('hooks/useRequiredPathParam', () => ({
    useRequiredPathParam: (k: string) =>
        k === 'projectId' ? PROJECT_ID : k === 'featureId' ? FEATURE_ID : '',
}));

vi.mock('hooks/api/getters/useFeature/useFeature', () => ({
    useFeature: () => ({
        feature: { name: FEATURE_ID, project: PROJECT_ID, environments: ENVS },
        loading: false,
        error: null,
        refetchFeature: vi.fn(),
    }),
}));

vi.mock('hooks/api/getters/useFeatureMetrics/useFeatureMetrics', () => ({
    useFeatureMetricsRaw: () => ({
        featureMetrics: [],
        loading: false,
        error: null,
    }),
}));

import { useFeatureMetricsEnvironments } from './FeatureExposureMetrics.tsx';

const IndexProbe: React.FC = () => {
    const { environments, defaultProductionIndex: dpi } =
        useFeatureMetricsEnvironments(PROJECT_ID, FEATURE_ID);
    return Array.from(environments).map((env, idx) => (
        <div key={`${env}-${idx}`} data-testid={dpi === idx ? 'dpi' : idx}>
            {env}
        </div>
    ));
};

const mount = () =>
    render(<IndexProbe />, {
        route: `/projects/${PROJECT_ID}/features/${FEATURE_ID}/metrics`,
    });

beforeEach(() => {
    PROJECT_ID = 'p';
    FEATURE_ID = 'f';
    ENVS = [];
});

describe('useFeatureMetricsEnvironments', () => {
    it('returns the name of the first production env (prod in middle)', async () => {
        ENVS = [
            { name: 'alpha', type: 'development' },
            { name: 'prod', type: 'production' },
            { name: 'beta', type: 'development' },
        ];
        mount();
        expect(await screen.findByTestId('dpi')).toHaveTextContent('prod');
    });

    it('falls back to first item when there is no production env', async () => {
        ENVS = [
            { name: 'alpha', type: 'development' },
            { name: 'beta', type: 'staging' },
        ];
        mount();
        expect(await screen.findByTestId('dpi')).toHaveTextContent('alpha');
    });

    it('returns -1 (or the contract value) for empty environments', async () => {
        ENVS = [];
        mount();
        expect(screen.queryByTestId('dpi')).not.toBeInTheDocument();
    });

    it('handles multiple productions by picking the first', async () => {
        ENVS = [
            { name: 'alpha', type: 'development' },
            { name: 'prod-a', type: 'production' },
            { name: 'beta', type: 'staging' },
            { name: 'prod-b', type: 'production' },
            { name: 'prod-c', type: 'production' },
        ];
        mount();
        expect(await screen.findByTestId('dpi')).toHaveTextContent('prod-a');
    });
});
