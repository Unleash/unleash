import React from 'react';
import {
    IntegrationParameter,
    type IIntegrationParameterProps,
} from './IntegrationParameter/IntegrationParameter.tsx';
import type { AddonTypeSchema } from 'openapi';
import { styled } from '@mui/material';

interface IIntegrationParametersProps {
    provider?: AddonTypeSchema;
    parametersErrors: IIntegrationParameterProps['parametersErrors'];
    editMode: boolean;
    setParameterValue: IIntegrationParameterProps['setParameterValue'];
    config: IIntegrationParameterProps['config'];
}

const StyledParagraph = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

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
            {editMode ? (
                <StyledParagraph>
                    Sensitive parameters will be masked with value "<i>*****</i>
                    ". If you don't change the value they will not be updated
                    when saving.
                </StyledParagraph>
            ) : null}
            {provider.parameters?.map((parameter) => (
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
