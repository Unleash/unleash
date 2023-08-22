import React from 'react';
import { IAddonProvider } from 'interfaces/addons';
import {
    IntegrationParameter,
    IIntegrationParameterProps,
} from './IntegrationParameter/IntegrationParameter';
import { StyledTitle } from '../IntegrationForm.styles';

interface IIntegrationParametersProps {
    provider?: IAddonProvider;
    parametersErrors: IIntegrationParameterProps['parametersErrors'];
    editMode: boolean;
    setParameterValue: IIntegrationParameterProps['setParameterValue'];
    config: IIntegrationParameterProps['config'];
}

export const IntegrationParameters = ({
    provider,
    config,
    parametersErrors,
    setParameterValue,
    editMode,
}: IIntegrationParametersProps) => {
    if (!provider) return null;
    return (
        <React.Fragment>
            <StyledTitle>Parameters</StyledTitle>
            {editMode ? (
                <p>
                    Sensitive parameters will be masked with value "<i>*****</i>
                    ". If you don't change the value they will not be updated
                    when saving.
                </p>
            ) : null}
            {provider.parameters.map(parameter => (
                <IntegrationParameter
                    key={parameter.name}
                    definition={parameter}
                    parametersErrors={parametersErrors}
                    config={config}
                    setParameterValue={setParameterValue}
                />
            ))}
        </React.Fragment>
    );
};
