import { TokenType } from '../../../../../interfaces/token';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import React from 'react';
import {
    StyledInputDescription,
    StyledSelectInput,
} from '../ApiTokenForm.styles';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';

interface IEnvironmentSelectorProps {
    type: string;
    environment?: string;
    setEnvironment: React.Dispatch<React.SetStateAction<string | undefined>>;
}
export const EnvironmentSelector = ({
    type,
    environment,
    setEnvironment,
}: IEnvironmentSelectorProps) => {
    const { environments } = useEnvironments();
    const selectableEnvs =
        type === TokenType.ADMIN
            ? [{ key: '*', label: 'ALL' }]
            : environments.map(environment => ({
                  key: environment.name,
                  label: `${environment.name.concat(
                      !environment.enabled ? ' - deprecated' : ''
                  )}`,
                  title: environment.name,
                  disabled: false,
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
