import { IFeatureEnvironment, IVariant } from '../model';
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
    getEnvironmentsForFeature(
        featureName: string,
    ): Promise<IFeatureEnvironment[]>;
    getAllByFeatures(
        features: string[],
        environment?: string,
    ): Promise<IFeatureEnvironment[]>;
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
        enabledIn?: { [environment: string]: boolean },
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
    addVariantsToFeatureEnvironment(
        featureName: string,
        environment: string,
        variants: IVariant[],
    ): Promise<void>;

    setVariantsToFeatureEnvironments(
        featureName: string,
        environments: string[],
        variants: IVariant[],
    ): Promise<void>;

    addFeatureEnvironment(
        featureEnvironment: IFeatureEnvironment,
    ): Promise<void>;

    clonePreviousVariants(environment: string, project: string): Promise<void>;
}
