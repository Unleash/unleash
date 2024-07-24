import type { AddonParameterSchema, AddonSchema } from 'openapi';

export interface IIntegrationParameterProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string, value: string | undefined) => void;
    config: AddonSchema;
}
