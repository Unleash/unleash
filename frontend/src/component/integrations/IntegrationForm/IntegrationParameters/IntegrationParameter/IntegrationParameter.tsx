import type { ChangeEventHandler, FC } from 'react';
import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { IntegrationParameterTextField } from './IntegrationParameterTextField.tsx';
import { IntegrationParameterKeyValuePairs } from './IntegrationParameterKeyValuePairs.tsx';
import { isKvpParam } from './KvpParameterUtils.ts';
import { GithubAppNameRepoMap } from './GithubAppNameRepoMap.tsx';

export interface IIntegrationParameterProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    setStructuredParameter: (param: string) => (value: unknown) => void;
    config: AddonSchema;
    projects: string[];
}

const customEditors: Record<string, FC<IIntegrationParameterProps>> = {
    'github:appNameRepoMap': GithubAppNameRepoMap,
};

export const IntegrationParameter = ({
    setParameterValue,
    setStructuredParameter,
    ...props
}: IIntegrationParameterProps) => {
    const CustomEditor =
        customEditors[`${props.config.provider}:${props.definition.name}`];

    return (
        <StyledAddonParameterContainer>
            {CustomEditor ? (
                <CustomEditor
                    setParameterValue={setParameterValue}
                    setStructuredParameter={setStructuredParameter}
                    {...props}
                />
            ) : isKvpParam(props.definition) ? (
                <IntegrationParameterKeyValuePairs
                    setParameterKvps={setStructuredParameter}
                    {...props}
                />
            ) : (
                <IntegrationParameterTextField
                    setParameterValue={setParameterValue}
                    {...props}
                />
            )}
        </StyledAddonParameterContainer>
    );
};
