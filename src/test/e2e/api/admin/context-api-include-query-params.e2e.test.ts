import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import { RoleName, TEST_AUDIT_USER } from '../../../../lib/types/index.js';

let db: ITestDb;
let app: IUnleashTest;
const projectA = { name: 'a', contextField: 'context-field-A' };
const projectB = { name: 'b', contextField: 'context-field-B' };
const rootContextField = 'context-field-root';

const projects = [projectA, projectB];

beforeAll(async () => {
    db = await dbInit('context_api_include_query_params_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    projectContextFields: true,
                },
            },
        },
        db.rawDatabase,
    );

    await setup();
});

const setup = async () => {
    const dummyAdmin = await app.services.userService.createUser(
        {
            name: 'Some Name',
            email: 'test@getunleash.io',
            rootRole: RoleName.ADMIN,
        },
        TEST_AUDIT_USER,
    );

    await app.services.contextService.createContextField(
        { name: rootContextField },
        TEST_AUDIT_USER,
    );

    for (const { name, contextField } of projects) {
        const project = await app.services.projectService.createProject(
            { name: name },
            dummyAdmin,
            TEST_AUDIT_USER,
        );
        await app.services.contextService.createContextField(
            { name: contextField, project: project.id },
            TEST_AUDIT_USER,
        );
    }
};

describe('Root and project-level context API respects the `include` query param', () => {
    it('fetches only root context fields without include=project on root API', async () => {
        const { body: contextFields } = await app.request
            .get(`/api/admin/context`)
            .set('Content-Type', 'application/json')
            .expect(200);

        const contextFieldNames = contextFields.map(({ name }) => name);
        expect(contextFieldNames.includes(rootContextField)).toBe(true);

        expect(contextFields.every(({ project }) => !project)).toBe(true);
    });

    it('fetches all context fields with include=project on root API', async () => {
        const { body: contextFields } = await app.request
            .get(`/api/admin/context?include=project`)
            .set('Content-Type', 'application/json')
            .expect(200);

        const contextFieldNames = contextFields.map(({ name }) => name);
        expect(contextFieldNames.includes(rootContextField)).toBe(true);
        for (const { contextField } of projects) {
            expect(contextFieldNames.includes(contextField)).toBe(true);
        }

        expect(contextFields.some(({ project }) => !!project)).toBe(true);
    });

    it('fetches only project context fields without include=root on project API', async () => {
        const { body: contextFields } = await app.request
            .get(`/api/admin/projects/${projectA.name}/context`)
            .set('Content-Type', 'application/json')
            .expect(200);

        expect(contextFields.length).toBe(1);
        expect(contextFields[0].name).toBe(projectA.contextField);
    });

    it('fetches root + project-specific context fields with include=root on project API', async () => {
        const { body: contextFields } = await app.request
            .get(`/api/admin/projects/${projectA.name}/context?include=root`)
            .set('Content-Type', 'application/json')
            .expect(200);

        const contextFieldNames = contextFields.map(({ name }) => name);
        expect(contextFieldNames.includes(rootContextField)).toBe(true);
        expect(contextFieldNames.includes(projectA.contextField)).toBe(true);
        expect(contextFieldNames.includes(projectB.contextField)).toBe(false);
    });
});
