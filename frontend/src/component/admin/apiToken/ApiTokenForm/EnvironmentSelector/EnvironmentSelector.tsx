import { TokenType } from '../../../../../interfaces/token';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import React from 'react';
import {
    StyledInputDescription,
    StyledSelectInput,
} from '../ApiTokenForm.styles';
import {
    IEnvironment,
    IProjectEnvironment,
} from '../../../../../interfaces/environments';

interface IEnvironmentSelectorProps {
    type: string;
    environment?: string;
    environments: IProjectEnvironment[] | IEnvironment[];
    setEnvironment: React.Dispatch<React.SetStateAction<string | undefined>>;
}
export const EnvironmentSelector = ({
    type,
    environment,
    setEnvironment,
    environments,
}: IEnvironmentSelectorProps) => {
    const isProjectEnv = (
        environment: IEnvironment | IProjectEnvironment
    ): environment is IProjectEnvironment => {
        return 'projectVisible' in environment;
    };
    const selectableEnvs =
        type === TokenType.ADMIN
            ? [{ key: '*', label: 'ALL' }]
            : environments.map(environment => ({
                  key: environment.name,
                  label: environment.name,
                  title: environment.name,
                  disabled: isProjectEnv(environment)
                      ? !environment.projectVisible
                      : !environment.enabled,
              }));

    return (
        <>
            <StyledInputDescription>
                Which environment should the token have access to?
            </StyledInputDescription>
            <StyledSelectInput
                disabled={type === TokenType.ADMIN}
                options={selectableEnvs}
                value={environment}
                onChange={setEnvironment}
                label="Environment"
                id="api_key_environment"
                name="environment"
                IconComponent={KeyboardArrowDownOutlined}
                fullWidth
            />
        </>
    );
};
