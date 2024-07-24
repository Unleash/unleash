import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import { IntegrationParameterTextField } from './IntegrationParameterTextField';
import { IntegrationParameterCheckbox } from './IntegrationParameterCheckbox';
import type { IIntegrationParameterProps } from './IntegrationParameterTypes';

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
