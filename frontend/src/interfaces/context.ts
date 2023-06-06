export interface IUnleashContextDefinition {
    name: string;
    description: string;
    createdAt: string;
    sortOrder: number;
    stickiness: boolean;
    usedInProjects?: number;
    usedInFeatures?: number;
    legalValues?: ILegalValue[];
}

export interface ILegalValue {
    value: string;
    description?: string;
}
