import { ChangeEventHandler } from 'react';
import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { IntegrationParameterTextField } from './IntegrationParameterTextField';
import { useUiFlag } from 'hooks/useUiFlag';

export interface IIntegrationParameterProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    config: AddonSchema;
}

export const IntegrationParameter = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
}: IIntegrationParameterProps) => {
    const datadogJson = useUiFlag('datadogJsonTemplate');
    if (
        config.provider === 'datadog' &&
        definition.name === 'bodyTemplate' &&
        !datadogJson
    ) {
        return null;
    }

    return (
        <StyledAddonParameterContainer>
            <IntegrationParameterTextField
                config={config}
                definition={definition}
                parametersErrors={parametersErrors}
                setParameterValue={setParameterValue}
            />
        </StyledAddonParameterContainer>
    );
};
