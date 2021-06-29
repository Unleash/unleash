import EnvironmentStore from '../../lib/db/environment-store';
import { IEnvironment } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';
import noLoggerProvider from './no-logger';

export default class FakeEnvironmentStore extends EnvironmentStore {
    environments: IEnvironment[] = [];

    constructor() {
        super(undefined, undefined, noLoggerProvider);
    }

    async getAll(): Promise<IEnvironment[]> {
        return Promise.resolve(this.environments);
    }

    async exists(name: string): Promise<Boolean> {
        return Promise.resolve(this.environments.some(e => e.name === name));
    }

    async getByName(name: string): Promise<IEnvironment> {
        const env = this.environments.find(e => e.name === name);
        if (env) {
            return Promise.resolve(env);
        }
        return Promise.reject(
            new NotFoundError(`Could not find environment with name ${name}`),
        );
    }

    async upsert(env: IEnvironment): Promise<IEnvironment> {
        this.environments = this.environments.filter(e => e.name !== env.name);
        this.environments.push(env);
        return Promise.resolve(env);
    }

    async connectProject(
        environment: string,
        projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    async connectFeatures(
        environment: string,
        projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    async delete(name: string): Promise<void> {
        this.environments = this.environments.filter(e => e.name !== name);
        return Promise.resolve();
    }

    async disconnectProjectFromEnv(
        environment: string,
        projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    async connectFeatureToEnvironmentsForProject(
        featureName: string,
        project_id: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }
}

module.exports = FakeEnvironmentStore;
