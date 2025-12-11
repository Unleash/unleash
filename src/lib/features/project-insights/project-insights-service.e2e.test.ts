import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { FeatureToggleService } from '../../../lib/features/feature-toggle/feature-toggle-service.js';
import type ProjectService from '../../../lib/features/project/project-service.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import type {
    EventService,
    ProjectInsightsService,
} from '../../../lib/services/index.js';
import { FeatureEnvironmentEvent } from '../../types/index.js';
import { subDays } from 'date-fns';
import {
    createEventsService,
    createFeatureToggleService,
    createProjectService,
} from '../../../lib/features/index.js';
import {
    type IUnleashStores,
    type IUser,
    TEST_AUDIT_USER,
} from '../../types/index.js';
import type { User } from '../../types/user.js';
import { createProjectInsightsService } from './createProjectInsightsService.js';
import { extractAuditInfoFromUser } from '../../util/index.js';

let stores: IUnleashStores;
let db: ITestDb;

let projectService: ProjectService;
let projectInsightsService: ProjectInsightsService;
let eventService: EventService;
let featureToggleService: FeatureToggleService;
let user: User; // many methods in this test use User instead of IUser
let opsUser: IUser;

beforeAll(async () => {
    db = await dbInit('project_service_serial', getLogger);
    stores = db.stores;
    // @ts-expect-error return type IUser type missing generateImageUrl
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    opsUser = await stores.userStore.insert({
        name: 'Test user',
        email: 'test@example.com',
    });
    const config = createTestConfig({
        getLogger,
    });
    eventService = createEventsService(db.rawDatabase, config);

    featureToggleService = createFeatureToggleService(db.rawDatabase, config);

    projectService = createProjectService(db.rawDatabase, config);

    projectInsightsService = createProjectInsightsService(
        db.rawDatabase,
        config,
    );
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {
    await stores.eventStore.deleteAll();
});

const updateFeature = async (featureName: string, update: any) => {
    return db.rawDatabase
        .table('features')
        .update(update)
        .where({ name: featureName });
};

test('should return average time to production per toggle', async () => {
    const project = {
        id: 'average-time-to-prod-per-toggle',
        name: 'average-time-to-prod-per-toggle',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(
        project,
        user,
        extractAuditInfoFromUser(user),
    );

    const toggles = [
        { name: 'average-prod-time-pt', subdays: 7 },
        { name: 'average-prod-time-pt-2', subdays: 14 },
        { name: 'average-prod-time-pt-3', subdays: 40 },
        { name: 'average-prod-time-pt-4', subdays: 15 },
        { name: 'average-prod-time-pt-5', subdays: 2 },
    ];

    const featureToggles = await Promise.all(
        toggles.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                toggle,
                extractAuditInfoFromUser(opsUser),
            );
        }),
    );

    await Promise.all(
        featureToggles.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project.id,
                    featureName: toggle.name,
                    environment: 'production',
                    auditUser: TEST_AUDIT_USER,
                }),
            );
        }),
    );

    await Promise.all(
        toggles.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    const result = await projectInsightsService.getDoraMetrics(project.id);

    expect(result.features).toHaveLength(5);
    expect(result.features[0].timeToProduction).toBeTruthy();
    expect(result.projectAverage).toBeTruthy();
});

test('should return average time to production per toggle for a specific project', async () => {
    const project1 = {
        id: 'average-time-to-prod-per-toggle-1',
        name: 'Project 1',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const project2 = {
        id: 'average-time-to-prod-per-toggle-2',
        name: 'Project 2',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(
        project1,
        user,
        extractAuditInfoFromUser(user),
    );
    await projectService.createProject(
        project2,
        user,
        extractAuditInfoFromUser(user),
    );

    const togglesProject1 = [
        { name: 'average-prod-time-pt-10', subdays: 7 },
        { name: 'average-prod-time-pt-11', subdays: 14 },
        { name: 'average-prod-time-pt-12', subdays: 40 },
    ];

    const togglesProject2 = [
        { name: 'average-prod-time-pt-13', subdays: 15 },
        { name: 'average-prod-time-pt-14', subdays: 2 },
    ];

    const featureTogglesProject1 = await Promise.all(
        togglesProject1.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project1.id,
                toggle,
                extractAuditInfoFromUser(opsUser),
            );
        }),
    );

    const featureTogglesProject2 = await Promise.all(
        togglesProject2.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project2.id,
                toggle,
                extractAuditInfoFromUser(opsUser),
            );
        }),
    );

    await Promise.all(
        featureTogglesProject1.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project1.id,
                    featureName: toggle.name,
                    environment: 'production',
                    auditUser: TEST_AUDIT_USER,
                }),
            );
        }),
    );

    await Promise.all(
        featureTogglesProject2.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project2.id,
                    featureName: toggle.name,
                    environment: 'production',
                    auditUser: TEST_AUDIT_USER,
                }),
            );
        }),
    );

    await Promise.all(
        togglesProject1.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    await Promise.all(
        togglesProject2.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    const resultProject1 = await projectInsightsService.getDoraMetrics(
        project1.id,
    );
    const resultProject2 = await projectInsightsService.getDoraMetrics(
        project2.id,
    );

    expect(resultProject1.features).toHaveLength(3);
    expect(resultProject2.features).toHaveLength(2);
});

test('should return average time to production per toggle and include archived toggles', async () => {
    const project1 = {
        id: 'average-time-to-prod-per-toggle-12',
        name: 'Project 1',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(
        project1,
        user,
        extractAuditInfoFromUser(user),
    );

    const togglesProject1 = [
        { name: 'average-prod-time-pta-10', subdays: 7 },
        { name: 'average-prod-time-pta-11', subdays: 14 },
        { name: 'average-prod-time-pta-12', subdays: 40 },
    ];

    const featureTogglesProject1 = await Promise.all(
        togglesProject1.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project1.id,
                toggle,
                extractAuditInfoFromUser(opsUser),
            );
        }),
    );

    await Promise.all(
        featureTogglesProject1.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project1.id,
                    featureName: toggle.name,
                    environment: 'production',
                    auditUser: TEST_AUDIT_USER,
                }),
            );
        }),
    );

    await Promise.all(
        togglesProject1.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    await featureToggleService.archiveToggle(
        'average-prod-time-pta-12',
        user,
        extractAuditInfoFromUser(user),
    );

    const resultProject1 = await projectInsightsService.getDoraMetrics(
        project1.id,
    );

    expect(resultProject1.features).toHaveLength(3);
});
