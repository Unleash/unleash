import {
    FeatureEnvironmentKey,
    IFeatureEnvironmentStore,
} from '../../lib/types/stores/feature-environment-store';
import { IFeatureEnvironment } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeFeatureEnvironmentStore
    implements IFeatureEnvironmentStore
{
    featureEnvironments: IFeatureEnvironment[] = [];

    async connectEnvironmentAndFeature(
        featureName: string,
        environment: string,
        enabled: boolean,
    ): Promise<void> {
        this.featureEnvironments.push({ environment, enabled, featureName });
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

    async disconnectEnvironmentFromProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        project: string,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    async enableEnvironmentForFeature(
        featureName: string,
        environment: string,
    ): Promise<void> {
        const fE = await this.get({ featureName, environment });
        fE.enabled = true;
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

    async getAllFeatureEnvironments(): Promise<IFeatureEnvironment[]> {
        return this.getAll();
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
        } catch (e) {
            return false;
        }
    }

    async removeEnvironmentForFeature(
        featureName: string,
        environment: string,
    ): Promise<void> {
        return this.delete({ featureName, environment });
    }

    async toggleEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<boolean> {
        const fE = await this.get({ environment, featureName });
        fE.enabled = enabled;
        return enabled;
    }
}
