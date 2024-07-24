import type { ChangeEvent } from 'react';
import { TextField, Typography } from '@mui/material';
import { styled } from '@mui/material';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { trim } from 'component/common/util';
import type { IIntegrationParameterProps } from './IntegrationParameterTypes';

const MASKED_VALUE = '*****';

const resolveType = ({ type = 'text', sensitive = false }, value: string) => {
    if (sensitive && value === MASKED_VALUE) {
        return 'text';
    }
    if (type === 'textfield') {
        return 'text';
    }
    return type;
};

export interface IIntegrationParameterTextFieldProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: IIntegrationParameterProps['setParameterValue'];
    config: AddonSchema;
}

const StyledTextField = styled(TextField)({
    width: '100%',
});

export const IntegrationParameterTextField = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
}: IIntegrationParameterTextFieldProps) => {
    const value = config.parameters[definition?.name] || '';
    const type = resolveType(
        definition,
        typeof value === 'string' ? value : '',
    );
    const error = parametersErrors[definition.name];
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value =
            trim(event?.target?.value) === ''
                ? undefined
                : event?.target?.value;
        setParameterValue(definition.name, value);
    };

    return (
        <StyledTextField
            size='small'
            minRows={definition.type === 'textfield' ? 5 : 0}
            multiline={definition.type === 'textfield'}
            type={type}
            label={
                <>
                    {definition.displayName}
                    {definition.required ? (
                        <Typography component='span'>*</Typography>
                    ) : null}
                </>
            }
            name={definition.name}
            placeholder={definition.placeholder || ''}
            InputLabelProps={{
                shrink: true,
            }}
            value={value}
            error={Boolean(error)}
            onChange={onChange}
            variant='outlined'
            helperText={definition.description}
        />
    );
};
