import { ChangeEventHandler } from 'react';
import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { IntegrationParameterEnableWithDropdown } from './IntegrationParameterEnableWithDropdown';
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
    if (config.provider === 'datadog' && definition.name === 'bodyTemplate') {
        const datadogJson = useUiFlag('datadogJsonTemplate');
        if (!datadogJson) {
            return null;
        }

        return (
            <IntegrationParameterEnableWithDropdown
                config={config}
                definition={definition}
                parametersErrors={parametersErrors}
                setParameterValue={setParameterValue}
                enableTitle='Data format'
                enableDescription="Choose the data format for the event body"
                disableOptionText="Standard"
                enableOptionText="Custom template (JSON)"
            />
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
