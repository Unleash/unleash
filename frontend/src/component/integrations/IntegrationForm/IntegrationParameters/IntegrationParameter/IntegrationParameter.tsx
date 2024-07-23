import type { ChangeEventHandler } from 'react';
import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { IntegrationParameterTextField } from './IntegrationParameterTextField';
import { IntegrationParameterCheckbox } from './IntegrationParameterCheckbox';

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
    if (definition.type === 'checkbox') {
        return (
            <StyledAddonParameterContainer>
                <IntegrationParameterCheckbox
                    config={config}
                    definition={definition}
                    parametersErrors={parametersErrors}
                    setParameterValue={setParameterValue}
                />
            </StyledAddonParameterContainer>
        );
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
