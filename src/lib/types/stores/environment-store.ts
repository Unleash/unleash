import { IEnvironment } from '../model';
import { Store } from './store';

export interface IEnvironmentStore extends Store<IEnvironment, string> {
    exists(name: string): Promise<boolean>;
    upsert(env: IEnvironment): Promise<IEnvironment>;
    connectProject(environment: string, projectId: string): Promise<void>;
    connectFeatures(environment: string, projectId: string): Promise<void>;
    disconnectProjectFromEnv(
        environment: string,
        projectId: string,
    ): Promise<void>;
    connectFeatureToEnvironmentsForProject(
        featureName: string,
        project_id: string,
    ): Promise<void>;
}
