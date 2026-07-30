import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { MetricSource } from 'component/impact-metrics/types';
import { useImpactMetricsEnabled } from './useImpactMetricsEnabled';

const server = testServerSetup();

const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
    </SWRConfig>
);

type Availability = NonNullable<
    ReturnType<typeof useUiConfig>['uiConfig']['impactMetrics']
>;

test.each<[Availability | undefined, MetricSource | undefined, boolean]>([
    [undefined, undefined, false],
    ['disabled', undefined, false],
    ['unconfigured', undefined, false],
    ['internal', undefined, true],
    ['external', undefined, true],
    ['full', undefined, true],
    ['internal', 'internal', true],
    ['internal', 'external', false],
    ['external', 'internal', false],
    ['external', 'external', true],
    ['full', 'internal', true],
    ['full', 'external', true],
    ['unconfigured', 'internal', false],
    ['disabled', 'external', false],
])('%s availability, %s source requested -> %s', async (impactMetrics, source, expected) => {
    testServerRoute(server, '/api/admin/ui-config', { impactMetrics });

    const { result } = renderHook(
        () => {
            const { uiConfig, loading, error } = useUiConfig();
            return {
                loading,
                error,
                availability: uiConfig.impactMetrics,
                enabled: useImpactMetricsEnabled(source),
            };
        },
        { wrapper },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.availability).toBe(impactMetrics);
    expect(result.current.enabled).toBe(expected);
});
