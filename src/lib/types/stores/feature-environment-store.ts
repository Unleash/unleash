import { IFeatureEnvironment } from '../model';
import { Store } from './store';

export interface FeatureEnvironmentKey {
    featureName: string;
    environment: string;
}

export interface IFeatureEnvironmentStore
    extends Store<IFeatureEnvironment, FeatureEnvironmentKey> {
    featureHasEnvironment(
        environment: string,
        featureName: string,
    ): Promise<boolean>;
    isEnvironmentEnabled(
        featureName: string,
        environment: string,
    ): Promise<boolean>;
    setEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<number>;
    getEnvironmentMetaData(
        environment: string,
        featureName: string,
    ): Promise<IFeatureEnvironment>;
    removeEnvironmentForFeature(
        featureName: string,
        environment: string,
    ): Promise<void>;
    addEnvironmentToFeature(
        featureName: string,
        environment: string,
        enabled: boolean,
    ): Promise<void>;
    disableEnvironmentIfNoStrategies(
        featureName: string,
        environment: string,
    ): Promise<void>;
    disconnectFeatures(environment: string, project: string): Promise<void>;
    connectFeatures(environment: string, projectId: string): Promise<void>;

    connectFeatureToEnvironmentsForProject(
        featureName: string,
        projectId: string,
        config?: [{ environment: string; enabled: boolean }],
    ): Promise<void>;

    connectProject(
        environment: string,
        projectId: string,
        idempotent?: boolean,
    ): Promise<void>;
    disconnectProject(environment: string, projectId: string): Promise<void>;
    copyEnvironmentFeaturesByProjects(
        sourceEnvironment: string,
        destinationEnvironment: string,
        projects: string[],
    ): Promise<void>;
    cloneStrategies(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void>;
}
