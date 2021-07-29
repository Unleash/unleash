import { Store } from './store';
import { IApplicationQuery } from '../query';

export interface IClientApplication {
    appName: string;
    updatedAt: Date;
    createdAt: Date;
    lastSeen: Date;
    description: string;
    createdBy: string;
    announced: boolean;
    url: string;
    color: string;
    icon: string;
    strategies: string[];
}

export interface IClientApplicationsStore
    extends Store<IClientApplication, string> {
    upsert(details: Partial<IClientApplication>): Promise<void>;
    bulkUpsert(details: Partial<IClientApplication>[]): Promise<void>;
    getAppsForStrategy(query: IApplicationQuery): Promise<IClientApplication[]>;
    getUnannounced(): Promise<IClientApplication[]>;
    setUnannouncedToAnnounced(): Promise<IClientApplication[]>;
}
