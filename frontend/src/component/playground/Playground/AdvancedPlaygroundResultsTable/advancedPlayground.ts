import { PlaygroundFeatureSchema } from 'openapi';

export type PlaygroundContext = Record<string, string>;

export interface AdvancedPlaygroundInput {
    environments: string[];
    project: string[];
    context: PlaygroundContext;
}

export interface AdvancedPlaygroundEnvironmentEvaluation
    extends PlaygroundFeatureSchema {
    context: PlaygroundContext;
}

export type AdvancedPlaygroundEnvironment =
    Array<AdvancedPlaygroundEnvironmentEvaluation>;

export interface AdvancedPlaygroundFeature {
    name: string;
    projectId: string;
    environments: Record<string, AdvancedPlaygroundEnvironment>;
}

export interface AdvancedPlaygroundResponse {
    input: AdvancedPlaygroundInput;
    features: Array<AdvancedPlaygroundFeature>;
}
