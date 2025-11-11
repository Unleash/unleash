import { renderHook, waitFor } from '@testing-library/react';
import { useMaintenanceBannerMessage } from './useMaintenanceBannerMessage.ts';
import { testServerRoute, testServerSetup } from 'utils/testServer.ts';
import { PayloadType, type Variant } from 'utils/variants.ts';

const server = testServerSetup();
const setupApi = (maintenanceMode?: boolean | Variant) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            maintenanceMode,
        },
    });
};

test('Returns custom string if variant has string payload', async () => {
    setupApi({
        name: 'Variant',
        enabled: true,
        payload: {
            type: PayloadType.STRING,
            value: '**Custom** message',
        },
    });
    const { result } = renderHook(() => useMaintenanceBannerMessage());

    await waitFor(() => expect(result.current).toBe('**Custom** message'));
});
