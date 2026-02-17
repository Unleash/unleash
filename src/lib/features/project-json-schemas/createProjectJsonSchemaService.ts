import type { IUnleashConfig } from '../../types/index.js';
import ProjectJsonSchemaService from './project-json-schema-service.js';
import FakeProjectJsonSchemaStore from './fake-project-json-schema-store.js';
import type { Db } from '../../db/db.js';
import { ProjectJsonSchemaStore } from './project-json-schema-store.js';

export const createProjectJsonSchemaService =
    (config: IUnleashConfig) =>
    (db: Db): ProjectJsonSchemaService => {
        const projectJsonSchemaStore = new ProjectJsonSchemaStore(db, config);
        return new ProjectJsonSchemaService({ projectJsonSchemaStore }, config);
    };

export const createFakeProjectJsonSchemaService = (
    config: IUnleashConfig,
): {
    projectJsonSchemaService: ProjectJsonSchemaService;
    projectJsonSchemaStore: FakeProjectJsonSchemaStore;
} => {
    const projectJsonSchemaStore = new FakeProjectJsonSchemaStore();
    const projectJsonSchemaService = new ProjectJsonSchemaService(
        { projectJsonSchemaStore },
        config,
    );
    return { projectJsonSchemaService, projectJsonSchemaStore };
};
