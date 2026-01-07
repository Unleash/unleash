export interface IFeatureLink {
    id: string;
    url: string;
    title: string | null;
    feature: string;
}

export interface IFeatureLinksReadModel {
    getLinks(...features: string[]): Promise<IFeatureLink[]>;
    getTopDomains(): Promise<{ domain: string; count: number }[]>;
}
