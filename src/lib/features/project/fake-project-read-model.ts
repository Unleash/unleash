import type { IProjectReadModel } from '../../types';
import type {
    ProjectForUi,
    ProjectForInsights,
} from './project-read-model-type';

export class FakeProjectReadModel implements IProjectReadModel {
    getProjectsForAdminUi(): Promise<ProjectForUi[]> {
        return Promise.resolve([]);
    }
    getProjectsForInsights(): Promise<ProjectForInsights[]> {
        return Promise.resolve([]);
    }
}
