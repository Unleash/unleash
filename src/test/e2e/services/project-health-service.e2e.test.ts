import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import ProjectHealthService from '../../../lib/services/project-health-service.js';
import { createTestConfig } from '../../config/test-config.js';
import {
    type IUnleashStores,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';
import type { IUser } from '../../../lib/types/index.js';
import { createProjectService } from '../../../lib/features/index.js';
import type { ProjectService } from '../../../lib/services/index.js';

let stores: IUnleashStores;
let db: ITestDb;
let projectService: ProjectService;
let projectHealthService: ProjectHealthService;
let user: IUser;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('project_health_service_serial', getLogger);
    stores = db.stores;
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    projectService = createProjectService(db.rawDatabase, config);
    projectHealthService = new ProjectHealthService(
        stores,
        config,
        projectService,
    );
});

afterAll(async () => {
    await db.destroy();
});
test('Project with no stale toggles should have 100% health rating', async () => {
    const project = {
        id: 'health-rating',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(
        project,
        user,
        TEST_AUDIT_USER,
    );
    await stores.featureToggleStore.create('health-rating', {
        name: 'health-rating-not-stale',
        description: 'new',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating', {
        name: 'health-rating-not-stale-2',
        description: 'new too',
        stale: false,
        createdByUserId: 9999,
    });
    const rating =
        await projectHealthService.calculateHealthRating(savedProject);
    expect(rating).toBe(100);
});

test('Project with two stale toggles and two non stale should have 50% health rating', async () => {
    const project = {
        id: 'health-rating-2',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(
        project,
        user,
        TEST_AUDIT_USER,
    );
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-not-stale',
        description: 'new',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-not-stale-2',
        description: 'new too',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-stale-1',
        description: 'stale',
        stale: true,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-stale-2',
        description: 'stale too',
        stale: true,
        createdByUserId: 9999,
    });
    const rating =
        await projectHealthService.calculateHealthRating(savedProject);
    expect(rating).toBe(50);
});

test('Project with one non-stale, one potentially stale and one stale should have 33% health rating', async () => {
    const project = {
        id: 'health-rating-3',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(
        project,
        user,
        TEST_AUDIT_USER,
    );
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-not-stale',
        description: 'new',
        stale: false,
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-potentially-stale',
        description: 'new too',
        type: 'release',
        stale: false,
        createdAt: new Date(Date.UTC(2020, 1, 1)),
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-stale',
        description: 'stale',
        stale: true,
        createdByUserId: 9999,
    });
    const rating =
        await projectHealthService.calculateHealthRating(savedProject);
    expect(rating).toBe(33);
});
