import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import { AccessService } from '../../../lib/services/access-service';
import ProjectService from '../../../lib/services/project-service';
import ProjectHealthService from '../../../lib/services/project-health-service';
import { createTestConfig } from '../../config/test-config';
import { IUnleashStores } from '../../../lib/types';
import { IUser } from '../../../lib/server-impl';
import { SegmentService } from '../../../lib/services/segment-service';
import { GroupService } from '../../../lib/services/group-service';

let stores: IUnleashStores;
let db: ITestDb;
let projectService;
let groupService;
let accessService;
let projectHealthService;
let featureToggleService;
let user: IUser;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('project_health_service_serial', getLogger);
    stores = db.stores;
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    groupService = new GroupService(stores, config);
    accessService = new AccessService(stores, config, groupService);
    featureToggleService = new FeatureToggleService(
        stores,
        config,
        new SegmentService(stores, config),
        accessService,
    );
    projectService = new ProjectService(
        stores,
        config,
        accessService,
        featureToggleService,
        groupService,
    );
    projectHealthService = new ProjectHealthService(
        stores,
        config,
        featureToggleService,
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
    const savedProject = await projectService.createProject(project, user);
    await stores.featureToggleStore.create('health-rating', {
        name: 'health-rating-not-stale',
        description: 'new',
        stale: false,
    });
    await stores.featureToggleStore.create('health-rating', {
        name: 'health-rating-not-stale-2',
        description: 'new too',
        stale: false,
    });
    const rating = await projectHealthService.calculateHealthRating(
        savedProject,
    );
    expect(rating).toBe(100);
});

test('Project with two stale toggles and two non stale should have 50% health rating', async () => {
    const project = {
        id: 'health-rating-2',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(project, user);
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-not-stale',
        description: 'new',
        stale: false,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-not-stale-2',
        description: 'new too',
        stale: false,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-stale-1',
        description: 'stale',
        stale: true,
    });
    await stores.featureToggleStore.create('health-rating-2', {
        name: 'health-rating-2-stale-2',
        description: 'stale too',
        stale: true,
    });
    const rating = await projectHealthService.calculateHealthRating(
        savedProject,
    );
    expect(rating).toBe(50);
});

test('Project with one non-stale, one potentially stale and one stale should have 33% health rating', async () => {
    const project = {
        id: 'health-rating-3',
        name: 'Health rating',
        description: 'Fancy',
    };
    const savedProject = await projectService.createProject(project, user);
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-not-stale',
        description: 'new',
        stale: false,
    });
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-potentially-stale',
        description: 'new too',
        type: 'release',
        stale: false,
        createdAt: new Date(Date.UTC(2020, 1, 1)),
    });
    await stores.featureToggleStore.create('health-rating-3', {
        name: 'health-rating-3-stale',
        description: 'stale',
        stale: true,
    });
    const rating = await projectHealthService.calculateHealthRating(
        savedProject,
    );
    expect(rating).toBe(33);
});
