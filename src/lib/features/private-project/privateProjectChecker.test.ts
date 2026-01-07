import { PrivateProjectChecker } from './privateProjectChecker.js';
import type { IPrivateProjectStore } from './privateProjectStoreType.js';

test('filter user accessible projects', async () => {
    const checker = new PrivateProjectChecker(
        {
            privateProjectStore: {
                async getUserAccessibleProjects() {
                    return {
                        mode: 'limited',
                        projects: ['projectA', 'projectB'],
                    };
                },
            } as IPrivateProjectStore,
        },
        { isEnterprise: true },
    );

    const projects = await checker.filterUserAccessibleProjects(123, [
        'projectA',
        'projectC',
    ]);

    expect(projects).toEqual(['projectA']);
});

test('do not filter for non enterprise', async () => {
    const checker = new PrivateProjectChecker(
        {
            privateProjectStore: {
                async getUserAccessibleProjects() {
                    return {
                        mode: 'limited',
                        projects: ['projectA', 'projectB'],
                    };
                },
            } as IPrivateProjectStore,
        },
        { isEnterprise: false },
    );

    const projects = await checker.filterUserAccessibleProjects(123, [
        'projectA',
        'projectC',
    ]);

    expect(projects).toEqual(['projectA', 'projectC']);
});

test('do not filter for all mode', async () => {
    const checker = new PrivateProjectChecker(
        {
            privateProjectStore: {
                async getUserAccessibleProjects() {
                    return { mode: 'all' };
                },
            } as IPrivateProjectStore,
        },
        { isEnterprise: false },
    );

    const projects = await checker.filterUserAccessibleProjects(123, [
        'projectA',
        'projectC',
    ]);

    expect(projects).toEqual(['projectA', 'projectC']);
});
