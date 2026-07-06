import { TokenType } from '../../../../../interfaces/token.ts';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import type React from 'react';
import { FormField } from 'component/common/FormField/FormField';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
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
            : environments.map((environment) => ({
                  key: environment.name,
                  label: `${environment.name.concat(
                      !environment.enabled ? ' - deprecated' : '',
                  )}`,
                  title: environment.name,
                  disabled: false,
              }));

    return (
        <FormField
            label='Environment'
            description='Which environment should the token have access to?'
        >
            <GeneralSelect
                disabled={type === TokenType.ADMIN}
                options={selectableEnvs}
                value={environment}
                onChange={setEnvironment}
                name='environment'
                IconComponent={KeyboardArrowDownOutlined}
                fullWidth
            />
        </FormField>
    );
};
