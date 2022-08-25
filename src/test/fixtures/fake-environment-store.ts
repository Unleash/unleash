import { IEnvironment } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';
import { IEnvironmentStore } from '../../lib/types/stores/environment-store';

export default class FakeEnvironmentStore implements IEnvironmentStore {
    importEnvironments(envs: IEnvironment[]): Promise<IEnvironment[]> {
        this.environments = envs;
        return Promise.resolve(envs);
    }

    environments: IEnvironment[] = [];

    disable(environments: IEnvironment[]): Promise<void> {
        for (let env of this.environments) {
            if (environments.map((e) => e.name).includes(env.name))
                env.enabled = false;
        }
        return Promise.resolve();
    }

    enable(environments: IEnvironment[]): Promise<void> {
        for (let env of this.environments) {
            if (environments.map((e) => e.name).includes(env.name))
                env.enabled = true;
        }
        return Promise.resolve();
    }

    count(): Promise<number> {
        return Promise.resolve(this.environments.length);
    }

    async getAll(): Promise<IEnvironment[]> {
        return Promise.resolve(this.environments);
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

    async create(env: IEnvironment): Promise<IEnvironment> {
        this.environments = this.environments.filter(
            (e) => e.name !== env.name,
        );
        this.environments.push(env);
        return Promise.resolve(env);
    }

    async update(
        env: Pick<IEnvironment, 'type' | 'protected'>,
        name: string,
    ): Promise<IEnvironment> {
        const found = this.environments.find(
            (en: IEnvironment) => en.name === name,
        );
        const idx = this.environments.findIndex(
            (en: IEnvironment) => en.name === name,
        );
        const updated = { ...found, env };

        this.environments[idx] = updated;
        return Promise.resolve(updated);
    }

    async updateSortOrder(id: string, value: number): Promise<void> {
        const environment = this.environments.find(
            (env: IEnvironment) => env.name === id,
        );
        environment.sortOrder = value;
        return Promise.resolve();
    }

    async updateProperty(
        id: string,
        field: string,
        value: string | number,
    ): Promise<void> {
        const environment = this.environments.find(
            (env: IEnvironment) => env.name === id,
        );
        environment[field] = value;
        return Promise.resolve();
    }

    async connectProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
    }

    async connectFeatures(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: string,
    ): Promise<void> {
        return Promise.reject(new Error('Not implemented'));
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
