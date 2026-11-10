import { afterAll, vi } from 'vitest';
import { installPromLastWins } from './prom-last-wins.js';

// Test files historically relied on per-file module isolation to clean up
// process-global state. When files share a module registry and process
// (isolate: false), that state survives file teardown and corrupts later
// files. This hook resets the known leaks at every test-file boundary; it is
// a no-op or harmless under full isolation, so it is safe in either mode.
//
// App modules are reached through dynamic import at hook time, NOT static
// imports: setup files are re-executed for every test file, and vitest would
// invalidate their statically imported module graph — re-executing the whole
// app for each file, which defeats isolate: false and double-registers
// prom-client metrics. Runtime imports resolve through the (shared) registry
// cache without joining this file's analyzed graph.

// Snapshot taken when this setup file runs, i.e. before the test file
// executes. Isolated forks got a fresh process.env per file; shared workers
// must restore it so files that mutate process.env directly (e.g.
// INIT_*_API_TOKENS) cannot reconfigure later files.
const envSnapshot = { ...process.env };

// Make prom-client registration last-wins so re-booting apps across test
// files cannot throw on duplicate metric names. Safe as a static import:
// this helper only pulls in prom-client, which is external and therefore
// not part of the setup file's invalidated module graph.
installPromLastWins();

afterAll(async () => {
    // Services subscribe to the shared emitter but never unsubscribe, so
    // listeners holding a file's (destroyed) DB pools would fire during
    // later files.
    const { sharedEventEmitter } = await import(
        '../lib/util/anyEventEmitter.js'
    );
    sharedEventEmitter.removeAllListeners();

    // Process-wide singletons: a later file must construct its own instance
    // instead of inheriting one bound to torn-down stores. `instance` is a
    // TS-private static, so it is reachable at runtime.
    const { ClientFeatureToggleDelta } = await import(
        '../lib/features/client-feature-toggles/delta/client-feature-toggle-delta.js'
    );
    (ClientFeatureToggleDelta as any).instance = undefined;

    const { default: ConfigurationRevisionService } = await import(
        '../lib/features/feature-toggle/configuration-revision-service.js'
    );
    (ConfigurationRevisionService as any).instance = undefined;

    // Impact metrics accumulate in a module-global registry; clear it so
    // counters from one file cannot inflate another's assertions.
    const { impactRegister } = await import(
        '../lib/features/metrics/impact/impact-register.js'
    );
    impactRegister.clear();

    // Some files enable fake timers without restoring them (e.g.
    // user-service.test.ts, api-token-service.test.ts); frozen timers hang
    // any later file that waits on a real delay.
    vi.useRealTimers();

    // Spies installed on shared module objects outlive their file otherwise.
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();

    for (const key of Object.keys(process.env)) {
        if (!(key in envSnapshot)) {
            delete process.env[key];
        }
    }
    Object.assign(process.env, envSnapshot);
});
