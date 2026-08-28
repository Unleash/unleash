import { vi } from 'vitest';
import ClientMetricsController from './metrics.js';

// The heartbeat/flavor emission is fully covered by instance-service.test.ts
// here we only assert the bulk-handler of `/api/client/metrics/bulk` that
// forwards each application's sdkFlavor into the register* calls
describe('bulk-handler', () => {
    const buildController = () => {
        const registerFrontendClient = vi.fn();
        const registerBackendClient = vi.fn().mockResolvedValue(undefined);

        const controller: any = Object.create(
            ClientMetricsController.prototype,
        );
        controller.config = { flagResolver: { isEnabled: () => false } };
        controller.logger = { warn: vi.fn(), error: vi.fn() };

        controller.metricsV2 = {
            resolveUserEnvironment: () => 'development',
            registerBulkMetrics: vi.fn(),
            registerImpactMetrics: vi.fn(),
        };

        controller.clientInstanceService = {
            registerFrontendClient,
            registerBackendClient,
        };

        controller.apiTokenService = { markSeenByTokens: vi.fn() };

        return { controller, registerFrontendClient, registerBackendClient };
    };

    const res = () => ({ status: () => ({ end: () => {} }) }) as any;

    const req = (applications: unknown[]) =>
        ({
            body: { applications, metrics: [] },
            user: {},
            headers: {},
            ip: '127.0.0.1',
            socket: { remoteAddress: '127.0.0.1' },
        }) as any;

    test('forwards sdk flavor from a frontend application', async () => {
        const { controller, registerFrontendClient } = buildController();

        await controller.bulkMetrics(
            req([
                {
                    appName: 'edge-forwarded-frontend-app',
                    instanceId: 'edge-instance-frontend',
                    environment: 'development',
                    sdkType: 'frontend',
                    sdkVersion: 'unleash-ios-sdk:2.5.0',
                    sdkFlavor: 'unleash-openfeature-swift-provider',
                    sdkFlavorVersion: '1.2.3',
                },
            ]),
            res(),
        );

        expect(registerFrontendClient).toHaveBeenCalledWith(
            expect.objectContaining({
                appName: 'edge-forwarded-frontend-app',
                sdkVersion: 'unleash-ios-sdk:2.5.0',
                sdkFlavor: 'unleash-openfeature-swift-provider',
                sdkFlavorVersion: '1.2.3',
            }),
        );
    });

    test('forwards sdk flavor from a backend application', async () => {
        const { controller, registerBackendClient } = buildController();

        const backendApp = {
            appName: 'edge-forwarded-backend-app',
            instanceId: 'edge-instance-backend',
            environment: 'development',
            sdkType: 'backend',
            sdkVersion: 'unleash-client-node:6.7.0',
            sdkFlavor: 'unleash-openfeature-node-provider',
            sdkFlavorVersion: '1.0.1',
            started: new Date().toISOString(),
            interval: 10000,
        };

        await controller.bulkMetrics(req([backendApp]), res());

        // registerBackendClient reads the raw sdkFlavor off the object - asserting the flavor is enough
        expect(registerBackendClient).toHaveBeenCalledWith(
            expect.objectContaining({
                sdkFlavor: 'unleash-openfeature-node-provider',
                sdkFlavorVersion: '1.0.1',
            }),
            expect.anything(), // clientIp — don't couple to extractClientIp normalization
            'development',
        );
    });
});
