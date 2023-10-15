import { TextField, Typography } from '@mui/material';
import { AddonParameterSchema, AddonSchema } from 'openapi';
import { ChangeEventHandler } from 'react';
import { styled } from '@mui/material';

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
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
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
            onChange={setParameterValue(definition.name)}
            variant='outlined'
            helperText={definition.description}
        />
    );
};
