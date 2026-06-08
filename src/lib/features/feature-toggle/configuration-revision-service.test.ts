import { register } from 'prom-client';

afterEach(() => {
    register.clear();
    vi.resetModules();
});

test('reuses an existing revision id metric when the module is loaded again', async () => {
    register.clear();
    vi.resetModules();

    await import('./configuration-revision-service.js');
    vi.resetModules();
    await import('./configuration-revision-service.js');

    const metrics = await register.getMetricsAsJSON();
    const revisionIdMetrics = metrics.filter(
        ({ name }) => name === 'environment_revision_id',
    );

    expect(revisionIdMetrics).toHaveLength(1);
});
