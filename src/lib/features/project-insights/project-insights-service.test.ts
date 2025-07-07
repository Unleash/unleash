import { createFakeProjectInsightsService } from './createProjectInsightsService.js';

test('Return basic insights', async () => {
    const {
        projectInsightsService,
        projectStatsStore,
        featureToggleStore,
        projectStore,
    } = createFakeProjectInsightsService();
    await featureToggleStore.create('default', {
        name: 'irrelevant',
        createdByUserId: 1,
        type: 'release',
    });
    await projectStore.create({
        id: 'default',
        name: 'irrelevant',
    });
    await projectStatsStore.updateProjectStats('default', {
        archivedCurrentWindow: 1,
        archivedPastWindow: 1,
        createdCurrentWindow: 1,
        createdPastWindow: 1,
        avgTimeToProdCurrentWindow: 1,
        projectActivityCurrentWindow: 1,
        projectActivityPastWindow: 1,
        projectMembersAddedCurrentWindow: 1,
    });

    const insights = await projectInsightsService.getProjectInsights('default');

    expect(insights).toEqual({
        stats: {
            archivedCurrentWindow: 1,
            archivedPastWindow: 1,
            createdCurrentWindow: 1,
            createdPastWindow: 1,
            avgTimeToProdCurrentWindow: 1,
            projectActivityCurrentWindow: 1,
            projectActivityPastWindow: 1,
            projectMembersAddedCurrentWindow: 1,
        },
        featureTypeCounts: [{ type: 'release', count: 1 }],
        health: {
            activeCount: 0,
            potentiallyStaleCount: 0,
            staleCount: 0,
            rating: 100,
        },
        technicalDebt: {
            activeCount: 0,
            potentiallyStaleCount: 0,
            staleCount: 0,
            rating: 0,
        },
        leadTime: { features: [], projectAverage: 0 },
        members: { currentMembers: 0, change: 0 },
    });
});
