import { TextField, Typography } from '@mui/material';
import { ChangeEventHandler } from 'react';
import { StyledAddonParameterContainer } from '../../IntegrationForm.styles';
import type { AddonParameterSchema, AddonSchema } from 'openapi';

const resolveType = ({ type = 'text', sensitive = false }, value: string) => {
    if (sensitive && value === MASKED_VALUE) {
        return 'text';
    }
    if (type === 'textfield') {
        return 'text';
    }
    return type;
};

const MASKED_VALUE = '*****';

export interface IIntegrationParameterProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    setParameterValue: (param: string) => ChangeEventHandler<HTMLInputElement>;
    config: AddonSchema;
}

export const IntegrationParameter = ({
    definition,
    config,
    parametersErrors,
    setParameterValue,
}: IIntegrationParameterProps) => {
    const value = config.parameters[definition?.name] || '';
    const type = resolveType(
        definition,
        typeof value === 'string' ? value : ''
    );
    const error = parametersErrors[definition.name];

    return (
        <StyledAddonParameterContainer>
            <TextField
                size="small"
                style={{ width: '100%' }}
                minRows={definition.type === 'textfield' ? 5 : 0}
                multiline={definition.type === 'textfield'}
                type={type}
                label={
                    <>
                        {definition.displayName}
                        {definition.required ? (
                            <Typography component="span" color="error">
                                *
                            </Typography>
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
                variant="outlined"
                helperText={definition.description}
            />
        </StyledAddonParameterContainer>
    );
};
