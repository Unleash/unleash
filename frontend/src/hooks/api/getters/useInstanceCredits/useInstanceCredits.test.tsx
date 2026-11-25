import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { SWRConfig } from 'swr';
import { expect, test, vi } from 'vitest';
import { testServerSetup } from 'utils/testServer';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useInstanceCredits } from './useInstanceCredits.js';

vi.mock('hooks/useUiFlag', () => ({ useUiFlag: () => true }));

const server = testServerSetup();

const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), errorRetryInterval: 1 }}>
        <AccessProviderMock permissions={[{ permission: ADMIN }]}>
            {children}
        </AccessProviderMock>
    </SWRConfig>
);

test('is not loading again while it retries a failed request', async () => {
    let calls = 0;
    server.use(
        http.get('/api/instance/credits', () => {
            calls++;
            return HttpResponse.json({}, { status: 502 });
        }),
    );
    const loadingStates: boolean[] = [];

    renderHook(
        () => {
            const { loading } = useInstanceCredits();
            loadingStates.push(loading);
        },
        { wrapper },
    );

    await waitFor(() => expect(calls).toBeGreaterThanOrEqual(3));
    expect(loadingStates[0]).toBe(true);
    expect(loadingStates.slice(loadingStates.indexOf(false))).not.toContain(
        true,
    );
});
