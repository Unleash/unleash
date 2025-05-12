export interface IFeatureLink {
    id: string;
    url: string;
    title: string | null;
}

export interface IFeatureLinksReadModel {
    getLinks(feature: string): Promise<IFeatureLink[]>;
    getTopDomains(): Promise<{ domain: string; count: number }[]>;
}
