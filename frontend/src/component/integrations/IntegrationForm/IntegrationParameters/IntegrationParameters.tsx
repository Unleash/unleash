import React from 'react';
import {
    IntegrationParameter,
    type IIntegrationParameterProps,
} from './IntegrationParameter/IntegrationParameter.tsx';
import type { AddonTypeSchema } from 'openapi';
import { styled } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import { isKvpParam } from './IntegrationParameter/KvpParameterUtils.ts';

interface IIntegrationParametersProps {
    provider?: AddonTypeSchema;
    parametersErrors: IIntegrationParameterProps['parametersErrors'];
    editMode: boolean;
    setParameterValue: IIntegrationParameterProps['setParameterValue'];
    setStructuredParameter: IIntegrationParameterProps['setStructuredParameter'];
    config: IIntegrationParameterProps['config'];
    projects: IIntegrationParameterProps['projects'];
}

const StyledParagraph = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

export const IntegrationParameters = ({
    provider,
    config,
    parametersErrors,
    setParameterValue,
    setStructuredParameter,
    editMode,
    projects,
}: IIntegrationParametersProps) => {
    const kvpEditorEnabled = useUiFlag('integrationParamKvpEditor');
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
            {provider.parameters
                ?.filter(
                    (parameter) => kvpEditorEnabled || !isKvpParam(parameter),
                )
                .map((parameter) => (
                    <IntegrationParameter
                        key={parameter.name}
                        definition={parameter}
                        parametersErrors={parametersErrors}
                        config={config}
                        setParameterValue={setParameterValue}
                        setStructuredParameter={setStructuredParameter}
                        projects={projects}
                    />
                ))}
        </React.Fragment>
    );
};
