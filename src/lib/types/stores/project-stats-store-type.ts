import { DoraFeaturesSchema } from '../../openapi';
import { IProjectStats } from '../../features/project/project-service';

export interface ICreateEnabledDates {
    created: Date;
    enabled: Date;
}

export interface IProjectStatsStore {
    updateProjectStats(projectId: string, status: IProjectStats): Promise<void>;
    getProjectStats(projectId: string): Promise<IProjectStats>;
    getTimeToProdDates(projectId: string): Promise<ICreateEnabledDates[]>;
    getTimeToProdDatesForFeatureToggles(
        projectId: string,
        toggleNames: string[],
    ): Promise<DoraFeaturesSchema[]>;
}
