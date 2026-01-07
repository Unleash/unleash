import type {
    FeatureEnvironmentKey,
    IFeatureEnvironmentStore,
} from '../../lib/types/stores/feature-environment-store.js';
import type { IFeatureEnvironment, IVariant } from '../../lib/types/model.js';
import NotFoundError from '../../lib/error/notfound-error.js';

export default class FakeFeatureEnvironmentStore
    implements IFeatureEnvironmentStore
{
    featureEnvironments: IFeatureEnvironment[] = [];

    async addEnvironmentToFeature(
        featureName: string,
        environment: string,
        enabled: boolean,
    ): Promise<void> {
        this.featureEnvironments.push({ environment, enabled, featureName });
    }

    async addVariantsToFeatureEnvironment(
        featureName: string,
        environment: string,
        variants: IVariant[],
    ): Promise<void> {
        this.setVariantsToFeatureEnvironments(
            featureName,
            [environment],
            variants,
        );
    }

    async setVariantsToFeatureEnvironments(
        featureName: string,
        environments: string[],
        variants: IVariant[],
    ): Promise<void> {
        this.featureEnvironments
            .filter(
                (fe) =>
                    fe.featureName === featureName &&
                    environments.includes(fe.environment),
            )
            .forEach((fe) => {
                fe.variants = variants;
            });
    }

    async delete(key: FeatureEnvironmentKey): Promise<void> {
        this.featureEnvironments.splice(
            this.featureEnvironments.findIndex(
                (fE) =>
                    fE.environment === key.environment &&
                    fE.featureName === key.featureName,
            ),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.featureEnvironments = [];
    }

    destroy(): void {}

    async disconnectFeatures(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _project: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    async exists(key: FeatureEnvironmentKey): Promise<boolean> {
        return this.featureEnvironments.some(
            (fE) =>
                fE.featureName === key.featureName &&
                fE.environment === key.environment,
        );
    }

    async featureHasEnvironment(
        environment: string,
        featureName: string,
    ): Promise<boolean> {
        return this.exists({ environment, featureName });
    }

    async get(key: FeatureEnvironmentKey): Promise<IFeatureEnvironment> {
        const featureEnvironment = this.featureEnvironments.find(
            (fE) =>
                fE.environment === key.environment &&
                fE.featureName === key.featureName,
        );
        if (featureEnvironment) {
            return featureEnvironment;
        }
        throw new NotFoundError(
            `Could not find environment ${key.environment} for feature: ${key.featureName}`,
        );
    }

    async getAll(): Promise<IFeatureEnvironment[]> {
        return this.featureEnvironments;
    }

    getEnvironmentMetaData(
        environment: string,
        featureName: string,
    ): Promise<IFeatureEnvironment> {
        return this.get({ environment, featureName });
    }

    async isEnvironmentEnabled(
        featureName: string,
        environment: string,
    ): Promise<boolean> {
        try {
            const fE = await this.get({ featureName, environment });
            return fE.enabled;
        } catch (_e) {
            return false;
        }
    }

    async removeEnvironmentForFeature(
        featureName: string,
        environment: string,
    ): Promise<void> {
        return this.delete({ featureName, environment });
    }

    async setEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<number> {
        const fE = await this.get({ environment, featureName });
        if (fE.enabled !== enabled) {
            fE.enabled = enabled;
            return 1;
        } else {
            return 0;
        }
    }

    async connectProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    async connectFeatures(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    async disconnectProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    async connectFeatureToEnvironmentsForProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _featureName: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projectId: string,
    ): Promise<void> {
        return Promise.resolve();
    }

    disableEnvironmentIfNoStrategies(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _featureName: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _environment: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    copyEnvironmentFeaturesByProjects(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _sourceEnvironment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _destinationEnvironment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _projects: string[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    cloneStrategies(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _sourceEnvironment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _destinationEnvironment: string,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async addFeatureEnvironment(
        featureEnvironment: IFeatureEnvironment,
    ): Promise<void> {
        this.featureEnvironments.push(featureEnvironment);
        return Promise.resolve();
    }

    getEnvironmentsForFeature(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _featureName: string,
    ): Promise<IFeatureEnvironment[]> {
        throw new Error('Method not implemented.');
    }

    async getAllByFeatures(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        features: string[],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment?: string,
    ): Promise<IFeatureEnvironment[]> {
        return this.featureEnvironments.filter(
            (featureEnv) =>
                (environment ? featureEnv.environment === environment : true) &&
                features.includes(featureEnv.featureName),
        );
    }

    async variantExists(featureName: string) {
        return this.featureEnvironments.some(
            (featureEnvironment) =>
                featureEnvironment.featureName === featureName &&
                featureEnvironment.variants &&
                featureEnvironment.variants.length > 0,
        );
    }
}
