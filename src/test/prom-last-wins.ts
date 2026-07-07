import { register, type Metric } from 'prom-client';

// prom-client's default registry is process-global, but test infrastructure
// executes app modules more than once per process: globalSetup runs once per
// vitest project in the main process, and workers re-boot apps across test
// files. Re-registering a metric name would throw "already been registered",
// so patch registration to be last-wins. Guarded on globalThis because this
// module itself can be evaluated multiple times (per project in the main
// process, per test file in workers) while prom-client, being external,
// stays a single shared instance.
const guard = globalThis as unknown as { __unleashPromLastWins?: boolean };

export const installPromLastWins = (): void => {
    if (guard.__unleashPromLastWins) {
        return;
    }
    guard.__unleashPromLastWins = true;
    const originalRegisterMetric = register.registerMetric.bind(register);
    register.registerMetric = (metric: Metric) => {
        // `name` exists on every metric at runtime but is absent from
        // prom-client's Metric typings.
        const { name } = metric as unknown as { name: string };
        register.removeSingleMetric(name);
        originalRegisterMetric(metric);
    };
};
