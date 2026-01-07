import type { IProjectReadModel } from '../../types/index.js';
import type {
    ProjectForUi,
    ProjectForInsights,
} from './project-read-model-type.js';

export class FakeProjectReadModel implements IProjectReadModel {
    getFeatureProject(): Promise<{ project: string; createdAt: Date } | null> {
        return Promise.resolve(null);
    }
    getProjectsForAdminUi(): Promise<ProjectForUi[]> {
        return Promise.resolve([]);
    }
    getProjectsForInsights(): Promise<ProjectForInsights[]> {
        return Promise.resolve([]);
    }
    getProjectsByUser(): Promise<string[]> {
        return Promise.resolve([]);
    }
    getProjectsFavoritedByUser(): Promise<string[]> {
        return Promise.resolve([]);
    }
}
