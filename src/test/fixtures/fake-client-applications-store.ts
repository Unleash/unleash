import {
    IClientApplication,
    IClientApplicationsStore,
} from '../../lib/types/stores/client-applications-store';
import NotFoundError from '../../lib/error/notfound-error';
import { IApplicationQuery } from '../../lib/types/query';

export default class FakeClientApplicationsStore
    implements IClientApplicationsStore
{
    apps: IClientApplication[] = [];

    async bulkUpsert(details: Partial<IClientApplication>[]): Promise<void> {
        // @ts-expect-error
        details.forEach((d) => this.apps.push(d));
    }

    async delete(key: string): Promise<void> {
        this.apps.splice(
            this.apps.findIndex((a) => a.appName === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.apps = [];
    }

    async deleteApplication(appName: string): Promise<void> {
        return this.delete(appName);
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.apps.some((a) => a.appName === key);
    }

    async get(key: string): Promise<IClientApplication> {
        const app = this.apps.find((a) => a.appName === key);
        if (app) {
            return app;
        }
        throw new NotFoundError(
            `Could not find application with appName: ${key}`,
        );
    }

    async getAll(): Promise<IClientApplication[]> {
        return this.apps;
    }

    async getApplication(appName: string): Promise<IClientApplication> {
        return this.get(appName);
    }

    async getAppsForStrategy(
        query: IApplicationQuery,
    ): Promise<IClientApplication[]> {
        if (query.strategyName) {
            return this.apps.filter((a) =>
                a.strategies.includes(query.strategyName),
            );
        }
        return this.apps;
    }

    async getUnannounced(): Promise<IClientApplication[]> {
        return this.apps.filter((a) => !a.announced);
    }

    async setUnannouncedToAnnounced(): Promise<IClientApplication[]> {
        this.apps = this.apps.map((a) => ({ ...a, announced: true }));
        return this.apps;
    }

    async upsert(details: Partial<IClientApplication>): Promise<void> {
        await this.delete(details.appName);
        return this.bulkUpsert([details]);
    }
}
