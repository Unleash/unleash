export type ProjectFeatureCore = {
    name: string;
    type: string;
    description: string | null;
    stale: boolean;
    favorite: false;
    impressionData: boolean;
    createdAt: Date;
    environments: [];
};
