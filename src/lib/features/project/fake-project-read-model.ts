import type { IProjectReadModel } from '../../types';
import type {
    ProjectForUi,
    ProjectForInsights,
} from './project-read-model-type';

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
}
