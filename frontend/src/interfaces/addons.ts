export interface IAddons {
    id: number;
    provider: string;
    description: string;
    enabled: boolean;
    events: string[];
    parameters: object;
}
