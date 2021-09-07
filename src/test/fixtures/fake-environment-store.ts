import { IEnvironment } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';
import { IEnvironmentStore } from '../../lib/types/stores/environment-store';

export default class FakeEnvironmentStore implements IEnvironmentStore {
    environments: IEnvironment[] = [];

    async getAll(): Promise<IEnvironment[]> {
        return this.environments;
    }

    async exists(name: string): Promise<boolean> {
        return this.environments.some((e) => e.name === name);
    }

    async getByName(name: string): Promise<IEnvironment> {
        const env = this.environments.find((e) => e.name === name);
        if (env) {
            return Promise.resolve(env);
        }
        return Promise.reject(
            new NotFoundError(`Could not find environment with name ${name}`),
        );
    }

    async upsert(env: IEnvironment): Promise<IEnvironment> {
        this.environments = this.environments.filter(
            (e) => e.name !== env.name,
        );
        this.environments.push(env);
        return Promise.resolve(env);
    }

    async delete(name: string): Promise<void> {
        this.environments = this.environments.filter((e) => e.name !== name);
        return Promise.resolve();
    }


    async deleteAll(): Promise<void> {
        this.environments = [];
    }

    destroy(): void {}

    async get(key: string): Promise<IEnvironment> {
        return this.environments.find((e) => e.name === key);
    }
}

module.exports = FakeEnvironmentStore;
