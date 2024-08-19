import type { IProjectReadModel } from '../../types';
import type {
    ProjectForUi,
    ProjectForInsights,
} from './project-read-model-type';

export class FakeProjectReadModel implements IProjectReadModel {
    getProjectsForAdminUi(): Promise<ProjectForUi[]> {
        throw new Error('Method not implemented.');
    }
    getProjectsForInsights(): Promise<ProjectForInsights[]> {
        throw new Error('Method not implemented.');
    }
}
