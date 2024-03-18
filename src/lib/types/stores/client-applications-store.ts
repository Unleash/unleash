import type { Store } from './store';
import type { IApplicationOverview } from '../../features/metrics/instance/models';

export interface IClientApplicationUsage {
    project: string;
    environments: string[];
}
export interface IClientApplication {
    appName: string;
    updatedAt: Date;
    createdAt: Date;
    lastSeen: Date;
    description: string;
    createdBy: string;
    createdByUserId?: number;
    announced: boolean;
    url: string;
    color: string;
    icon: string;
    strategies: string[];
    usage?: IClientApplicationUsage[];
}

export interface IClientApplications {
    applications: IClientApplication[];
    total: number;
}

export interface IClientApplicationsSearchParams {
    searchParams?: string[];
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface IClientApplicationsStore
    extends Store<IClientApplication, string> {
    upsert(details: Partial<IClientApplication>): Promise<void>;
    bulkUpsert(details: Partial<IClientApplication>[]): Promise<void>;
    getApplications(
        params: IClientApplicationsSearchParams,
    ): Promise<IClientApplications>;
    getUnannounced(): Promise<IClientApplication[]>;
    setUnannouncedToAnnounced(): Promise<IClientApplication[]>;
    getApplicationOverview(appName: string): Promise<IApplicationOverview>;
}
